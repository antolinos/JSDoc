
/**
 * 
 * @witdh
 * @height
 */
function MacromoleculeForm(args) {
	this.id = BUI.id();
	this.width = 700;
	this.height = 500;

	if (args != null) {
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height;
		}
	}
}

MacromoleculeForm.prototype.getMacromolecule = function() {
	this.macromolecule.name = Ext.getCmp(this.panel.getItemId()).getValues().name;
	this.macromolecule.acronym = Ext.getCmp(this.panel.getItemId()).getValues().acronym;
	this.macromolecule.comments = Ext.getCmp(this.panel.getItemId())
			.getValues().comments;
	this.macromolecule.extintionCoefficient = Ext
			.getCmp(this.panel.getItemId()).getValues().extintionCoefficient;
	this.macromolecule.molecularMass = Ext.getCmp(this.panel.getItemId())
			.getValues().molecularMass;
	return this.macromolecule;
};

MacromoleculeForm.prototype.setMacromolecule = function(macromolecule) {
	this.pdbStore.loadData(macromolecule.structure3VOs);

};

MacromoleculeForm.prototype.getForm = function(macromolecule) {
	this.panel = Ext.createWidget('form', {

		frame : false,
		border : 0,
		padding : 15,
		width : 550,
		height : 350,
		items : [ {
			xtype : 'container',
			layout : 'hbox',
			items : [ {
				xtype : 'container',
				flex : 1,
				border : false,
				layout : 'anchor',
				defaultType : 'requiredtext',
				items : [ {
					fieldLabel : 'Name',
					name : 'name',
					anchor : '95%',
					tooltip : "Name of the macromolecule",
					value : macromolecule.name
				}, {
					fieldLabel : 'Acronym',
					name : 'acronym',
					anchor : '95%',
					value : macromolecule.acronym
				} ]
			}, {
				xtype : 'container',
				flex : 1,
				layout : 'anchor',
				defaultType : 'textfield',
				items : [ {
					xtype : 'numberfield',
					fieldLabel : 'Mol. Mass (Da)',
					name : 'molecularMass',
					value : macromolecule.molecularMass,
					decimalPrecision : 6
				}, {
					xtype : 'numberfield',
					fieldLabel : 'Extinction coef.',
					name : 'extintionCoefficient',
					value : macromolecule.extintionCoefficient,
					decimalPrecision : 6
				} ]
			} ]
		}, {
			xtype : 'textareafield',
			name : 'comments',
			fieldLabel : 'Comments',
			value : macromolecule.comments,
			width : this.width - 10
		} ]
	});
	return this.panel;
};

MacromoleculeForm.prototype.getPanel = function(macromolecule) {
	this.macromolecule = macromolecule;
	return Ext.createWidget('tabpanel', {
		height : 420,
		margin : 5,
		plain : true,
		style : {
			padding : 5
		},
		items : [ {
			tabConfig : {
				title : "General",
				disabled : false
			},
			items : [ this.getForm(macromolecule) ]
		}, {
			tabConfig : {
				title : "PDB & Sequences ",
				disabled : false
			},
			items : [ this.getPDBGrid(macromolecule) ]
		}, {
			tabConfig : {
				title : "Assembly",
				tooltip : 'Description of subunits present in the macromolecule',
				disabled : false
			},
			items : [ this.getMolarityGrid(macromolecule) ]
		} ]
	});
};

MacromoleculeForm.prototype.update = function() {
	var _this = this;
	BIOSAXS.proposal.onInitialized.attach(function() {
				if (BIOSAXS.proposal != null) {
					var macromolecules = BIOSAXS.proposal.macromolecules;
					for (var i = 0; i < macromolecules.length; i++) {
						if (macromolecules[i].macromoleculeId == _this.macromolecule.macromoleculeId) {
							_this.macromolecule = macromolecules[i];
							_this.setMacromolecule(_this.macromolecule);
							_this.molarityStore.loadData(_this.parseMolarityData(_this.macromolecule));
							_this.pdbGrid.setLoading(false);
							_this.molarityGrid.setLoading(false);

						}
					}
				}
			});
	this.molarityGrid.setLoading("Updating");
	this.pdbGrid.setLoading("Updating");
	BIOSAXS.proposal.init();
};

/**********************************************
 * MOLARITY GRID
 **********************************************/

MacromoleculeForm.prototype.parseMolarityData = function(macromolecule) {
	var data = [];
	if (macromolecule.stoichiometry != null){
		for (var i = 0; i < macromolecule.stoichiometry.length; i++) {
			data.push({
				ratio : macromolecule.stoichiometry[i].ratio,
				acronym : macromolecule.stoichiometry[i].macromolecule3VO.acronym,
				comments : macromolecule.stoichiometry[i].macromolecule3VO.comments,
				stoichiometryId : macromolecule.stoichiometry[i].stoichiometryId,
				name : macromolecule.stoichiometry[i].macromolecule3VO.name
			});
		}
	}
	return data;
};

MacromoleculeForm.prototype.getMolarityGrid = function(macromolecule) {
	var _this = this;

	this.molarityStore = Ext.create('Ext.data.Store', {
		fields : [ 'acronym', 'ratio', 'comments', 'stoichiometryId', 'name' ],
		data : this.parseMolarityData(macromolecule),
		sorters : {
			property : 'ratio',
			direction : 'DESC'
		}
	});

	this.molarityGrid = Ext.create('Ext.grid.Panel',
					{
						store : this.molarityStore,
						height : 350,
						padding : 5,
						columns : [
								
								{
									text : 'Subunit',
									columns : [
													{
														text : "Acronym",
														width : 100,
														hidden : false,
														dataIndex : 'acronym',
														sortable : true
													},
													{
														text : "Name",
														width : 100,
														hidden : false,
														dataIndex : 'name',
														sortable : true
													},
													{
														text : "Comments",
														width : 200,
														dataIndex : 'comments',
														sortable : true
													}]
								},
								{
											text : "Number",
											flex : 0.1,
											dataIndex : 'ratio',
											tooltip : 'Number of times this subunit is present in the macromolecule',
											sortable : true
								},
								{
									id : this.id + 'MOLARITY_REMOVE',
									flex : 0.1,
									sortable : false,
									renderer : function(value, metaData,record, rowIndex, colIndex, store) {
										return BUI.getRedButton('REMOVE');
									}
								}],
								listeners : {
									cellclick : function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
											if (grid.getGridColumns()[cellIndex].getId() == _this.id + 'MOLARITY_REMOVE') {
												var dataAdapter = new BiosaxsDataAdapter();
												dataAdapter.onSuccess.attach(function() {
													_this.molarityGrid.setLoading(false);
													_this.update();
												});
												dataAdapter.removeStoichiometry(record.data.stoichiometryId);
												_this.molarityGrid.setLoading("Removing Structure");
											}
									}
								},
						buttons : [ {
							text : 'Add molarity',
							handler : function() {
								function onClose() {
									w.destroy();
									_this.update();
								}
								var w = Ext.create('Ext.window.Window',
												{
													title : 'Molarity',
													height : 200,
													width : 500,
													modal : true,
													buttons : [
															{
																text : 'Save',
																handler : function() {
																	var macromoleculeId = (_this.macromoleculeCombo.getValue());
																	var ratio = Ext.getCmp(_this.id+ "ratio").getValue();
																	var comments = "";
																	var dataAdapter = new BiosaxsDataAdapter();
																	dataAdapter.onSuccess.attach(function(sender, args){
																		_this.update();
																		w.destroy();
																	});
																	dataAdapter.saveStoichiometry(_this.macromolecule.macromoleculeId, macromoleculeId, ratio, comments);
																}
															},
															{
																text : 'Cancel',
																handler : function() {
																	onClose();
																}
															} ],
													items : [ _this.getMolarityForm(macromolecule)],
													listeners : {
														onEsc : function() {
															onClose();
														},
														close : function() {
															onClose();
														}
													}
												}).show();
							}
						} ]
					});
	return this.molarityGrid;
};



/**********************************************
 * PDB GRID
 **********************************************/
MacromoleculeForm.prototype.getPDBGrid = function(macromolecule) {
	var _this = this;
	console.log(macromolecule)
	this.pdbStore = Ext.create('Ext.data.Store', {
		fields : [ 'filePath', 'structureId', 'structureType', 'structureId',
				'name' ],
		data : macromolecule.structure3VOs,
		groupField : 'structureType',
		sorters : {
			property : 'structureId',
			direction : 'DESC'
		}
	});

	var groupingFeature = Ext.create('Ext.grid.feature.Grouping',
					{
						groupHeaderTpl : Ext.create(
										'Ext.XTemplate',
										"<div style='background:#0ca3d2; color:white; float:left; font-size:10px; margin:6px 8px 0 0; padding:5px 8px;'>{name:this.formatName}</div>",
										{
											formatName : function(name) {
												return name;
											}
										}),
						hideGroupedHeader : true,
						startCollapsed : false
					});

	this.pdbGrid = Ext.create('Ext.grid.Panel',
					{
						store : this.pdbStore,
						features : [ groupingFeature ],
						buttons : [
								{
									text : 'Add PDB file',
									handler : function() {
										function onClose() {
											w.destroy();
											_this.update();
										}
										var w = Ext.create('Ext.window.Window',
														{
															title : 'Upload PDB File',
															height : 200,
															width : 400,
															modal : true,
															buttons : [ {
																text : 'Close',
																handler : function() {
																	onClose();
																}
															} ],
															layout : 'fit',
															items : {
																html : "<iframe style='width:500px' src='uploadPdbFileSAXS.do?reqCode=display&macromoleculeId="
																		+ macromolecule.macromoleculeId
																		+ "&type=PDB'></iframe>"
															},
															listeners : {
																onEsc : function() {
																	onClose();
																},
																close : function() {
																	onClose();
																}
															}
														}).show();
									}
								},
								{
									text : 'Add FASTA file',
									handler : function() {
										function onClose() {
											w.destroy();
											_this.update();
										}
										var w = Ext.create('Ext.window.Window',
														{
															title : 'Upload FASTA File',
															height : 200,
															width : 400,
															modal : true,
															buttons : [ {
																text : 'Close',
																handler : function() {
																	onClose();
																}
															} ],
															layout : 'fit',
															items : {
																html : "<iframe style='width:500px' src='uploadPdbFileSAXS.do?reqCode=display&macromoleculeId="
																		+ macromolecule.macromoleculeId
																		+ "&type=FASTA'></iframe>"

															},
															listeners : {
																onEsc : function() {
																	onClose();
																},
																close : function() {
																	onClose();
																}
															}
														}).show();
									}
								}

						],
						columns : [
								{
									text : "structureId",
									flex : 0.2,
									hidden : true,
									dataIndex : 'structureId',
									sortable : true
								},
								// {
								// text : "File",
								// flex : 0.6,
								// dataIndex : 'filePath',
								// sortable : true
								// },
								{
									text : "Name",
									flex : 0.6,
									dataIndex : 'name',
									sortable : true
								},
								{
									text : "Type",
									flex : 0.2,
									dataIndex : 'structureType',
									sortable : true
								},

								{
									id : this.id + 'REMOVE',
									flex : 0.2,
									sortable : false,
									renderer : function(value, metaData,
											record, rowIndex, colIndex, store) {
										return BUI.getRedButton('REMOVE');
									}
								}, ],
						padding : 5,
						height : 350,
						listeners : {
							itemdblclick : function(dataview, record, item, e) {
								_this._editExperiment(record.raw.experimentId);
							},
							cellclick : function(grid, td, cellIndex, record,
									tr, rowIndex, e, eOpts) {

								if (grid.getGridColumns()[cellIndex].getId() == _this.id
										+ 'REMOVE') {
									var dataAdapter = new BiosaxsDataAdapter();
									dataAdapter.onSuccess.attach(function() {
										_this.pdbGrid.setLoading(false);
										_this.update();
									});
									dataAdapter.removeStructure(record.data.structureId);
									_this.pdbGrid.setLoading("Removing PDB file");
								}

							}
						}
					});

	return this.pdbGrid;
};

MacromoleculeForm.prototype.getMolarityForm = function(macromolecule) {
	var _this = this;
	var data = [];
	for (var i = 0; i < BIOSAXS.proposal.macromolecules.length; i++) {
		var m = BIOSAXS.proposal.macromolecules[i];
		if (m.macromoleculeId != macromolecule.macromoleculeId){
			data.push(m);
		}
		
	}
	this.macromoleculeCombo = BIOSAXS_COMBOMANAGER.getComboMacromoleculeByMacromolecules(data, {
		width : 250,
		labelWidth : 100,
		margin : 10
	});
	
	return Ext.createWidget('form', {

			frame : false,
			border : 0,
//			padding : 15,
			width : 550,
			height : 350,
			items : [ {
				xtype : 'container',
				flex : 1,
				border : false,
				layout : 'anchor',
				defaultType : 'requiredtext',
				items : [ 
				          this.macromoleculeCombo,
				          {
								xtype : 'numberfield',
								name : 'Ratio',
								id : _this.id+ "ratio",
								fieldLabel : 'Ratio',
								value : 1,
								decimalPrecision : 6,
								margin : 10
						  }, {
								xtype : 'textareafield',
								name : 'comments',
								fieldLabel : 'Comments',
								margin : 10,
								width : 400,
								value : ""
								
							}]
			}]
		});
	
};

/*********************
 * JAVASCRIPT DOC
 *********************/
MacromoleculeForm.prototype.input = function() {
	return {
		macromolecule : DATADOC.getMacromolecule_10()
	};
};

MacromoleculeForm.prototype.test = function(targetId) {
	var macromoleculeForm = new MacromoleculeForm();
	var panel = macromoleculeForm
			.getPanel(macromoleculeForm.input().macromolecule);
	panel.render(targetId);
};
