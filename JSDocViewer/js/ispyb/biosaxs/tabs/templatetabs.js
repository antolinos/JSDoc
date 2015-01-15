/**
 * Shows an template with the specimens, measurements and the experiment's
 * requirement
 * 
 * @targetId
 */
function TemplateTabs(targetId) {
	this.height = 900;
	this.targetId = targetId;

	this.id = BUI.id();
	var _this = this;

	this.gridHeight = 1000;
	/** data * */
	this.experiment = null;

	this.specimenSelected = null;

	this.samplePlateGroupWidget = new SamplePlateGroupWidget({
		showTitle : false,
		height : 250,
		margin : 5,
		bbar : true

	});
	this.samplePlateGroupWidget.onExperimentChanged.attach(function(sender, json) {
		_this.refresh(new Experiment(json));
	});

	this.samplePlateGroupWidget.onClick.attach(function(sender, args) {
				/** Clicking on a plate * */
				var row = args.row;
				var column = args.column;
				var samplePlateId = args.samplePlate.samplePlateId;

				/** is specimen selected on the grid? * */
				if (_this.specimenSelected != null) {
					/** Is position target empty * */
					if (_this.experiment.getSampleByPosition(args.samplePlate.samplePlateId, args.row, args.column).length == 0) {
						var specimen = _this.experiment.getSampleById(_this.specimenSelected.specimenId);
						if (specimen.sampleplateposition3VO == null) {
							specimen.sampleplateposition3VO = {};
						}

						specimen.sampleplateposition3VO = {
							columnNumber : column,
							rowNumber : row,
							samplePlateId : samplePlateId
						};

						_this.samplePlateGroupWidget.panel.setLoading("ISPyB: Saving specimen");
						var adapter = new BiosaxsDataAdapter();
						/** If success * */
						adapter.onSuccess.attach(function(sender, experiment) {
							_this.samplePlateGroupWidget.panel.setLoading(false);
						});

						adapter.onError.attach(function(sender, error) {
							_this.samplePlateGroupWidget.panel.setLoading(false);
							showError(error);
						});

						adapter.saveSpecimen(specimen, _this.experiment);

						_this.samplePlateGroupWidget.refresh(_this.experiment);
						_this.specimenGrid.refresh(_this.experiment);
						_this.refresh(_this.experiment);
						_this.specimenGrid.deselectAll();
					} else {
						/**
						 * Can we merge? We can merge when specimen are the
						 * same. So, same buffer, macromolecule, concentration *
						 */
						var target = _this.experiment.getSampleByPosition(args.samplePlate.samplePlateId, args.row, args.column)[0];
						var specimen = _this.experiment.getSampleById(_this.specimenSelected.specimenId);

						if ((specimen.bufferId == target.bufferId) && (specimen.concentration == target.concentration)) {
							if (((specimen.macromolecule3VO != null) && (target.macromolecule3VO != null) && (specimen.macromolecule3VO.macromoleculeId == target.macromolecule3VO.macromoleculeId)) || 
									((specimen.macromolecule3VO == null) && (target.macromolecule3VO == null))) {
								var adapter = new BiosaxsDataAdapter();
								adapter.onSuccess.attach(function(sender, data) {
									_this.refresh(new Experiment(data));
									_this.samplePlateGroupWidget.panel.setLoading(false);
								});
								adapter.onError.attach(function(sender, error) {
									_this.samplePlateGroupWidget.panel.setLoading(false);
									showError(error);
								});
								_this.samplePlateGroupWidget.panel.setLoading("ISPyB: Merging specimens");
								adapter.mergeSpecimens(specimen.specimenId, target.specimenId);
							}
						} else {
							alert("Well is not empty. Select another well!");
						}
					}
				} else {
					var specimen = _this.experiment.getSampleByPosition(args.samplePlate.samplePlateId, args.row, args.column)[0];
					if (specimen != null) {
						_this.specimenGrid.selectById(specimen.specimenId);
					}
				}
			});

	this.volumePlanificator = new VolumeGrid();

	/** For Measurements * */
	/*
	 * var viscosityEditor = new Ext.form.field.ComboBox({ typeAhead: true,
	 * triggerAction: 'all', store: [ ['low','low'], ['medium', 'medium'],
	 * ['high', 'high'] ] });
	 */
	var storeViscosity = Ext.create('Ext.data.Store', {
		fields : [ 'name' ],
		data : [ {
			"name" : "low"
		}, {
			"name" : "medium"
		}, {
			"name" : "high"
		} ]
	});

	// Create the combo box, attached to the states data store
	var viscosityEditor = Ext.create('Ext.form.ComboBox', {
		fieldLabel : '',
		store : storeViscosity,
		queryMode : 'local',
		displayField : 'name',
		valueField : 'name'
	});

	this.measurementGrid = new MeasurementGrid({
		height : this.gridHeight,
		width : 940,
		maxWidth : 1500,
		estimateTime : false,
		positionColumnsHidden : true,
		isPriorityColumnHidden : true,
		isStatusColumnHidden : true,
		isTimeColumnHidden : true,
		updateRowEnabled : true,
		collapsed : true,
		removeBtnEnabled : true,
		showTitle : false,
		collapseBtnEnable : false,
		addBtnMultipleEdit : true,
		sortingBtnEnable : true,
//		experimentColorBased : true,
		editor : {
			exposureTemperature : {
				xtype : 'textfield',
				allowBlank : true
			},
			comments : {
				xtype : 'textfield',
				allowBlank : true
			},
			volumeToLoad : {
				xtype : 'numberfield',
				allowBlank : true
			},
			transmission : {
				xtype : 'numberfield',
				allowBlank : true
			},
			viscosity : viscosityEditor,
			waitTime : {
				xtype : 'numberfield',
				allowBlank : true
			},
			flow : {
				xtype : 'checkbox',
				allowBlank : true
			}
		}
	});

	this.measurementGrid.onSelected.attach(function(sender, measurements) {
		var specimens = [];
		for ( var i = 0; i < measurements.length; i++) {
			specimens.push(_this.experiment.getSampleById(measurements[i].specimenId));
		}
	});

	this.measurementGrid.onMeasurementChanged.attach(function(sender, measurement) {
		_this.experiment.setMeasurement(measurement);
		_this.refresh(_this.experiment);
	});

	this.measurementGrid.onExperimentChanged.attach(function(sender, json) {
		_this.refresh(new Experiment(json));
	});

	this.measurementGrid.onRemoved.attach(function(sender, experiment) {
		_this.refreshSpecimen(new Experiment(experiment));
	});

	this.measurementGrid.onUpdateTime.attach(function(sender, args) {
		document.getElementById(_this.id + "_counter").innerHTML = args.hours + 'h,  ' + args.minutes + 'min and ' + args.seconds + ' seconds';
	});

	this.specimenGrid = new SpecimenGrid({
		minHeight : 425,
		selectionMode : "SINGLE",
		editEnabled : false,
		updateRowEnabled : true,
		width : 900,
		showTitle : false
//		experimentColorBased : true
	});

	this.specimenGrid.onSpecimenChanged.attach(function(sender, specimen) {

		_this.experiment.setSpecimenById(specimen);
		_this.refresh(_this.experiment);
	});

	this.specimenGrid.onSelected.attach(function(sender, specimens) {
		if (specimens.length > 0) {
			_this.specimenSelected = specimens[0];
		} else {
			_this.specimenSelected = null;
		}
		_this.samplePlateGroupWidget.selectSpecimens(specimens);
	});
}

TemplateTabs.prototype.refreshMeasurement = function(experiment) {
	this.experiment = experiment;
	this.experiment.onSaved = new Event(this);
	this.experiment.onSpecimenSaved = new Event(this);
	var experimentList = new ExperimentList([ this.experiment ]);
	this.measurementGrid.refresh(experimentList.getMeasurementsNotCollected(), experimentList);
};

TemplateTabs.prototype.refreshSpecimen = function(experiment) {
	this.experiment = experiment;
	this.experiment.onSaved = new Event(this);
	this.experiment.onSpecimenSaved = new Event(this);
	this.samplePlateGroupWidget.refresh(this.experiment);
	this.specimenGrid.refresh(this.experiment);
	this.volumePlanificator.refresh(this.experiment);
};

TemplateTabs.prototype.refresh = function(experiment) {
	// var start = new Date().getTime();
	this.experiment = experiment;
	this.experiment.onSaved = new Event(this);
	this.experiment.onSpecimenSaved = new Event(this);

	// var experimentList = new ExperimentList([this.experiment]);
	this.refreshMeasurement(experiment);
	this.refreshSpecimen(experiment);
	/** Refreshing grids * */
	this.panel.setLoading(false);

	//	
	// var end = new Date().getTime();
	// var time = end - start;
	// console.log('Execution time refresh: ' + time);

};

TemplateTabs.prototype.error = function(error) {
	var e = JSON.parse(error);
	showError(e);
	this.panel.setLoading(false);

};

TemplateTabs.prototype.draw = function(experiment) {
	this.render(experiment);
};

TemplateTabs.prototype.getAssemblyTitle = function() {
	// return 'Assemblies (' + this.experiment.getAssemblies().length + ')';
	return 'Assemblies';
};

TemplateTabs.prototype.getMacromoleculeTitle = function() {
	// return 'Macromolecules (' + this.experiment.getMacromolecules().length +
	// ')';
	return 'Macromolecules';
};

TemplateTabs.prototype.getBuffersTitle = function() {
	// return 'Buffers (' + this.experiment.getBuffers().length + ')';
	return 'Buffers';
};

TemplateTabs.prototype.getPlateGroupsTitle = function() {
	// return 'Plate Groups (' + this.experiment.getPlateGroups().length + ')';
	return 'Plate Groups';
};

TemplateTabs.prototype.getSampleChangerTitle = function() {
	return 'Sample Changer';
};

TemplateTabs.prototype.getSpecimenTitle = function() {
	// return 'Specimens(' + this.experiment.getSpecimenCount() + ')';
	return 'Solution/Specimens';
};

TemplateTabs.prototype.getPlatesTitle = function() {
	// return 'Plates(' + this.experiment.getSamplePlates().length + ')';
	return 'Plates';
};

// TemplateTabs.prototype.getBuffersTip = function() {
// if (this.experiment.getBuffers().length == 0){
// return BUI.getWarningHTML("There are no buffers. Click on add to create new
// ones. Click on edit button or double click to edit them");
//		
// }
// else{
// return BUI.getTipHTML("Click on edit button or double click to edit them.
// Click on duplicate to create an identical buffer including its additives")
// }
// };

// TemplateTabs.prototype.getSpecimensTip = function() {
// if (this.experiment.getBuffers().length == 0){
// return BUI.getErrorHTML("There are no buffers. Before creating new specimen
// you should create any buffer")
// }
// if (this.experiment.getMacromolecules().length == 0){
// return BUI.getErrorHTML("There are no macromolecules. Before creating new
// specimen you should add an assembly")
// }
//	
// var specimens = this.experiment.getSamples();
//	
// if (specimens.length == 0){
// return BUI.getWarningHTML("There are no samples. Use the wizard for creating
// specimens automatically")
// }
//	
// return BUI.getTipHTML("Use settings button to set all the properties for a
// range of specimens");
// };

TemplateTabs.prototype.getSpecimenContainerHeight = function(experiment) {
	var maxItems = 0;
	if (maxItems < experiment.getSamples().length + 1) {
		maxItems = experiment.getSamples().length + 1;
	}

	var height = (maxItems + 1) * 40 + 40;
	if (height > 400) {
		height = 400;
	}
	return height;
};

TemplateTabs.prototype.getGeneralContainerHeight = function(experiment) {
	var maxItems = 0;
	// if (maxItems < experiment.getSamples().length){
	// maxItems = experiment.getSamples().length;
	// }
	if (maxItems < experiment.getExperimentMacromolecules().length) {
		maxItems = experiment.getExperimentMacromolecules().length;
	}
	if (maxItems < experiment.getBuffers().length) {
		maxItems = experiment.getBuffers().length;
	}

	var height = (maxItems + 1) * 40 + 40;
	if (height > 200) {
		height = 200;
	}
	return height;
};

TemplateTabs.prototype.getExperimentTitle = function() {
	var _this = this;
	var experimentHeaderForm = new ExperimentHeaderForm();
	return experimentHeaderForm.getPanel(this.experiment);

	// return BUI.getExperimentHeader(this.experiment);
};

TemplateTabs.prototype.render = function(experiment) {
	var _this = this;
	this.experiment = experiment;

	var specimenContainer = Ext.create('Ext.container.Container', {
		type : 'vbox',
		minHeight : 425,
		border : 0,
		width : 1000,
		padding : '5px',
		items : [ this.specimenGrid.getPanelByExperiment(experiment), this.samplePlateGroupWidget.getPanel(experiment) ]
	});

	var experimentList = new ExperimentList([ _this.experiment ]);
	var measurementContainer = Ext.create('Ext.container.Container', {
		layout : {
			type : 'vbox'
		},
		defaults : {
			style : {
				padding : '5px 0px 0px 10px'
			}
		},
		items : [ _this.measurementGrid.getPanel(experimentList.getMeasurementsNotCollected(), experimentList) ]
	});

	this.panel = Ext
			.createWidget(
					'tabpanel',
					{
						plain : true,
						style : {
							padding : 2
						},
						items : [
							{
								tabConfig : {
									title : 'Measurements'
								},
								items : [ {
									xtype : 'container',
									layout : 'vbox',
									border : 1,
									height : _this.gridHeight,
									flex : 1,
									items : [ measurementContainer ]
								}

								]
							},
							{
								tabConfig : {
									id : 'genralTabl',
									title : "Specimens"
								// width : 900,
								// border : 3

								},
								items : [ specimenContainer ]
							},
							{
								tabConfig : {
									title : "Requirements"

								},
								items : [
									{
										html : BUI.getTipHTML("Estimated volume is the maximum volume required. Depending on the order of your measurements you may use less. Click on create stock solutions if you plan to ship these stock solutions"),
										margin : "10 10 10 10",
										border : 0
									}, this.volumePlanificator.getPanel(experiment) ]
							} ]
					});
	// );
	return this.getPanel(this.panel);
};

TemplateTabs.prototype.isTemplate = function() {
	if (this.experiment.json.type == "TEMPLATE") {
		return true;
	}
	return false;
};

TemplateTabs.prototype.getPanel = function(panel) {
	var _this = this;
	if (this.experimentPanel == null) {
		this.experimentPanel = Ext.create('Ext.container.Container', {
			bodyPadding : 2,
			width : Ext.getBody().getViewSize().width * 0.9,
			renderTo : this.targetId,
			style : {
				padding : 2
			},
			items : [ this.getExperimentTitle(), this.panel ],
			listeners : {
				afterrender : function(thisCmp) {
					$("#SchemeReport" + _this.experiment.experimentId).click(function() {
						$(this).target = "_blank";
						window.open('viewProjectList.do?reqCode=display&menu=platescheme&experimentId=' + _this.experiment.experimentId);
						return false;
					});

				}
			}
		});
	}
	return this.experimentPanel;
};

TemplateTabs.prototype.input = function(targetId) {
	return new ExperimentTabs().input();
};

TemplateTabs.prototype.test = function(targetId) {
	var experimentTabs = new TemplateTabs(targetId);
	BIOSAXS.proposal = new Proposal(experimentTabs.input().proposal);
	experimentTabs.draw(new Experiment(experimentTabs.input().experiment));
};
