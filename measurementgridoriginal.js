

/** Measurement grid Class **/
function MeasurementGrid(args){
	this.id = BUI.id();
	
	this.height = 500;
	this.width = 800;
	
	this.maxWidth = 1200;
	this.maxHeight = 600;
	this.minHeight = 500;
	
	this.unitsFontSize = 9;
	this.title = "Measurements";
	this.estimateTime = false;
	this.collapsed = true;
	this.tbar = true;
	
	this.showTitle = true;
	
	this.updateRowEnabled = true; 
	 
	/** Hash map containing the keys of the editable columns. Ex: 'exposureTemperature' **/
	this.editor =   {
						comments : {
								xtype		: 'textfield',
								allowBlank	: true
						}
					};
	
	this.isTimeColumnHidden = false;
	this.isStatusColumnHidden = false;
	this.isPriorityColumnHidden = true;
	this.margin = "0 0 0 0";

	/** If measurement Status is done mark green row **/
	this.markDone = false;
	
	this.addBtnEnable = true;
	this.sorter = [{
	 	           		property : 'priority',
	 	                direction: 'ASC'
					}];
	
	this.removeBtnEnabled = false;
	this.collapseBtnEnable = true;
	this.addBtnMultipleEdit = false;

	var _this = this;
	this.selModel = Ext.create('Ext.selection.RowModel', {
	 	allowDeselect : true,
	 	mode			: 'MULTI',
        listeners: {
            selectionchange: function(sm, selections) {
            	var selected = new Array();
            	for ( var i = 0; i < selections.length; i++) {
            		selected.push(selections[i].raw);
				}
            	_this.onSelected.notify(selected);
            }
        }
    });
	
	if (args != null){
		
		
		if (args.tbar != null){
			this.tbar = args.tbar;
		}
		
		if (args.sorter != null){
			this.sorter = args.sorter;
		}
		
	}
	this.onClick = new Event(this);
	this.onSelected = new Event(this);
	this.onRemoved = new Event(this);
	this.onUpdateTime = new Event(this);
	this.onMeasurementChanged = new Event(this);
	this.onExperimentChanged = new Event(this);
};


MeasurementGrid.prototype._getMenu = function() {
	var _this = this;
	if (this.tbar){
		
		var items = new Array();
		if (_this.addBtnEnable){
			items.push(
					{
						icon 			: '../shared/icons/fam/add.gif',
				        text			: 'Add',
				        handler			: function(){
				        					_this.openAddMeasurementWindow();
				        }
				  }
			);
		}
		
		if (_this.addBtnMultipleEdit){
			items.push( {
				icon 			: '../shared/icons/fam/edit-icon.png',
		        text			: 'Multiple Edit',
		        handler			: function(){
		        						var multipleEditMeasurementGridWindow = new MultipleEditMeasurementGridWindow();
		        						multipleEditMeasurementGridWindow.onExperimentChanged.attach(function(sender, data){
		        							_this.onExperimentChanged.notify(data);
		        						});
		        						
		        						multipleEditMeasurementGridWindow.draw(_this.measurements, _this.experiments);
		        	
		        }
			 });
		}
		
		items.push(  "->");
		
		if (_this.collapseBtnEnable){
			items.push( {
		        text			: 'Collapse buffers',
		        enableToggle	: true,
		        scope			: this,
		        toggleHandler	: function(item, pressed){
		        	this.collapsed = pressed;
		        	this.grid.getStore().loadData(this.prepareData(this.measurements, this.experiments), false);
		        },
		        pressed: this.collapsed
			 });
		}
		 var tb = Ext.create('Ext.toolbar.Toolbar', {
			    items: items
			});
		 
		return tb;
	}
	else{
		return null;
	}
};

//MeasurementGrid.prototype._checkMacromoleculeFilter = function(macromoleculeId) {
//	if (this.macromoleculeFilterId == null){
//		return true;
//	}
//	else{
//		for ( var i = 0; i < this.macromoleculeFilterId.length; i++) {
//			if (this.macromoleculeFilterId[i] == macromoleculeId){
//				return true;
//			}
//		}
//	}
//	return false;
//};

MeasurementGrid.prototype.openAddMeasurementWindow = function(measurements, experiments){
	var _this = this;
	
 	var wizardWidget = new WizardWidget();
	
 	wizardWidget.onFinished.attach(function(sender, result){
 		
		var adapter = new BiosaxsDataAdapter();
		adapter.onSuccess.attach(function(sender, data){
			 _this.onExperimentChanged.notify(data);
			 _this.grid.setLoading(false);	
			 wizardWidget.window.close();	
			 
			 /** Setting priorities **/
//			 var adapterPriorities = new BiosaxsDataAdapter();
//			 adapterPriorities.onSuccess.attach(function(sender, data){
//				 var experimentList =  new ExperimentList([new Experiment(data)]);
//				 _this.refresh(experimentList.getMeasurementsNotCollected(), experimentList);
//				 _this.showStatusBarReady();
//			 });
//			 adapterPriorities.onError.attach(function(sender, error){
//				 showError(error);
//			 });
//			 
//			 adapterPriorities.setPriorities(_this.experiments.experiments[0].experimentId);
//			 _this.showStatusBarBusy('ISPyB is optimizing the number of measurements');
			
		});
		wizardWidget.current.setLoading("ISPyB: Adding measurements");
		adapter.addMeasurements(result.name, "comments", result.data, _this.experiments.experiments[0].experimentId);
	});
 	
 	
	wizardWidget.draw(null, new MeasurementCreatorStepWizardForm(BIOSAXS.proposal.getMacromolecules(), {noNext:true}));
};
MeasurementGrid.prototype.prepareData = function(measurements, experiments){
	var data = new Array();
			
	for (var i = 0; i < measurements.length; i++){
		var measurement = measurements[i];
		var specimen = experiments.getSampleById(measurement.specimenId);
		
		var buffer = experiments.getBufferById(specimen.bufferId)
		measurement["buffer_acronym"] = buffer.acronym;
		measurement["bufferId"] = buffer.bufferId;
		measurement["volume"] = specimen.volume;
		if (specimen.macromolecule3VO != null){
			measurement["acronym"] = specimen.macromolecule3VO.acronym;
			measurement["macromoleculeId"] = specimen.macromolecule3VO.macromoleculeId;
//			if (!this._checkMacromoleculeFilter(specimen.macromolecule3VO.macromoleculeId)){
//				continue;
//			}
		}
		measurement["concentration"] = specimen.concentration;
		if (measurement.run3VO != null){
				measurement["energy"] = measurement.run3VO.energy;
				measurement["expExposureTemperature"] = measurement.run3VO.exposureTemperature;
				measurement["storageTemperature"] = measurement.run3VO.storageTemperature;
				measurement["timePerFrame"] = measurement.run3VO.timePerFrame;
				measurement["radiationAbsolute"] = measurement.run3VO.radiationAbsolute;
				measurement["radiationRelative"] = measurement.run3VO.radiationRelative;
				measurement["status"] = "DONE";
			
			try{
				measurement["miliseconds"] = moment( measurement.run3VO.timeStart).format("X");
			}
			catch(E){
				console.log(E);
			}
		}

		if (this.collapsed){
			/** If collapsed only the samples **/
			if (specimen.macromolecule3VO != null){
				data.push(measurement);
			}
		}
		else{
			data.push(measurement);
		}
		
	}
	return data;
};


MeasurementGrid.prototype.refresh = function(measurements, experiments){
	this.experiments = experiments;
	this.measurements = measurements;
	this.store.loadData(this.prepareData(measurements, experiments), false);
};

MeasurementGrid.prototype.showStatusBarBusy = function(msg){
	var statusBar = Ext.getCmp(this.id + 'basic-statusbar');
	statusBar.setStatus({
	    text		: msg,
	    iconCls		: 'x-status-busy',
	    clear		: false
	});




};
