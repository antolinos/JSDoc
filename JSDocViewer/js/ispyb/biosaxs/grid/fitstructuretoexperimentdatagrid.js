
function FitStructureToExperimentDataGrid() {

}

FitStructureToExperimentDataGrid.prototype.getStructuresByMacromolecule = function(macromolecule) {
	var structures = [];
	if (macromolecule.structure3VOs != null) {
		if (macromolecule.structure3VOs.length > 0) {
			for (var i = 0; i < macromolecule.structure3VOs.length; i++) {
				structures.push(macromolecule.structure3VOs[i]);
			}
		}
	}
	return structures;
};

FitStructureToExperimentDataGrid.prototype._prepareData = function(structures, fits) {
	var data = [];
	for (var i = 0; i < structures.length; i++) {
		function hasFit(structure) {
			for (var j = 0; j < fits.length; j++) {
				if (fits[j].structureId == structure.structureId) {
					return fits[j];
				}
			}
			return null;
		}
		data.push(structures[i]);
		var fit = hasFit(structures[i]);
		if (fit != null) {
			data[data.length - 1]["fitStructureToExperimentalDataId"] = fit.fitStructureToExperimentalDataId;
			data[data.length - 1]["comments"] = fit.comments;
		}
		data[data.length - 1]["subtractionId"] = this.subtractionId;
	}
	return data;

};

FitStructureToExperimentDataGrid.prototype.refresh = function(subtractionId, macromolecule) {
	var _this = this;
	this.subtractionId = subtractionId;
	this.macromolecule = macromolecule;
	var adapter = new BiosaxsDataAdapter();
	adapter.onSuccess.attach(function(sender, fits) {
		var structures = _this.getStructuresByMacromolecule(macromolecule);
		_this.store.loadData(_this._prepareData(structures, fits), false);

	});
	adapter.getFitStructureToExperimentalDataBySubtractionId(subtractionId);
};

FitStructureToExperimentDataGrid.prototype.getPanel = function() {
	var _this = this;
	this.store = Ext.create('Ext.data.Store', {
		fields : [ 'name', 'structureId', 'fitStructureToExperimentalDataId', 'subtractionId', 'comments' ],
		data : []
	//macromolecule.structure3VOs
	});

	this.store.sort([ {
		property : 'name',
		direction : 'ASC'
	} ]);

	this.panel = Ext.create('Ext.grid.Panel', {
		title : 'Fitting Structures to Experimental Data',
		store : this.store,
		deferredRender : false,
		tbar : [ {
			text : 'Refresh',
			icon : '../images/export.gif',
			handler : function() {
				_this.refresh(_this.subtractionId, _this.macromolecule);
			}
		} ],
		columns : [ {
			text : 'Name',
			dataIndex : 'name'
		}, {
			text : 'structureId',
			dataIndex : 'structureId',
			hidden : true,
			flex : 1
		}, {
			text : 'Comments',
			dataIndex : 'comments',
			flex : 1
		}, {
			//			text : 'FIT',
			dataIndex : 'fitStructureToExperimentalDataId',
			sortable : true,
			width : 400,
			id : 'showFit',
			renderer : function(val, y, sample) {
				var fitId = val;//data[0].fitStructureToExperimentalDataId;
				if (sample.raw.comments != null) {
					if (sample.raw.comments.indexOf("Sent") != -1) {
						return "";
					}
				}
				if ((fitId == null) || (val == "")) {
					return BUI.getBlueButton('RUN', {
						height : 20,
						width : 100
					});
				}
				return BUI.getGreenButton('SHOW', {
					height : 20,
					width : 100
				});

				//								return data[0].fitStructureToExperimentalDataId;
			}
		} ],
		listeners : {
			cellclick : function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {

				if (grid.getGridColumns()[cellIndex].getId() == 'showFit') {
					/** It may be: show the already executed fit or to run  **/
					if ((record.data.fitStructureToExperimentalDataId != null) && (record.data.fitStructureToExperimentalDataId != "")) {
						var fitStructureToDataWidget = new FitStructureToDataWidget();
						Ext.create('Ext.window.Window', {
							title : 'Fit Structure to Data',
							height : 600,
							width : 900,
							layout : 'fit',
							items : [ fitStructureToDataWidget.getPanel() ]
						}).show();

						fitStructureToDataWidget.refresh(record.data.fitStructureToExperimentalDataId, record.data.structureId);
					} else {
						_this.RUNFitScattering(record.data.subtractionId, record.data.structureId);
					}
				}
			},
			afterrender : function() {
			}
		}
	});
	return this.panel;
};

/** Static method **/
FitStructureToExperimentDataGrid.prototype.RUNFitScattering = function(subtractionId, structureId) {
	var _this = this;
	/** Add to Workflow **/
	var adapter = new BiosaxsDataAdapter();
	var workflow = {
		'workflowTitle' : 'FitExperimentalDatatoStructure',
		'comments' : 'FitExperimentalDatatoStructure run from ISPyB for subtractionId: ' + subtractionId + ' and structureId ' + structureId
	}

	var inputs = [ {
		name : 'subtractionId',
		value : subtractionId
	}, {
		name : 'structureId',
		value : structureId
	} ];

	adapter.onSuccess.attach(function(sender, data) {
		/** Add to Fit **/
		var adapter2 = new BiosaxsDataAdapter();
		var fit = {
			'workflowId' : data.workflowId,
			'subtractionId' : subtractionId,
			'structureId' : structureId,
			'comments' : 'Sent to workflow engine'
		}
		adapter2.onSuccess.attach(function(sender, fit) {
			_this.refresh(_this.subtractionId, _this.macromolecule);
		});
		adapter2.addFitStructureData(fit);

	});
	adapter.addWorkflow(workflow, inputs);

};