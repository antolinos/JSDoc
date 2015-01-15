
/**
 * Shows an experiments with the specimens, measurements, analysis tabs where
 * results are shown and the frames widget
 * 
 * @targetId
 */
function ExperimentTabs(targetId) {
	this.height = 900;
	this.targetId = targetId;

	this.id = BUI.id();
	var _this = this;

	this.INTERVAL_UPDATE = BUI.getUpdateInterval();

	this.gridHeight = 1000;
	/** data * */
	this.experiment = null;

	/** For Overview * */
	this.samplePlateGroupWidget = new SamplePlateGroupWidget({
		showTitle : false,
		height : 250,
		margin : 5,
		border : 0

	});

	/** For Measurements * */
	this.measurementSamplePlateGroupWidget = new SamplePlateGroupWidget({
		showTitle : false,
		height : 250,
		margin : '5 0 0 0',
		border : 0
	});

	this.measurementGridDone = new MeasurementGrid({
		height : 800,
		minHeight : 400,
		maxHeight : 800,
		positionColumnsHidden : true,
		showTitle : false,
		estimateTime : true,
		width : 900,
		maxWidth : 1500,
		addBtnEnable : false,
		markDone : true,
		removeBtnEnabled : false
	});
	this.measurementGridDone.onSelected.attach(function(sender, measurements) {
		var specimens = [];
		for ( var i = 0; i < measurements.length; i++) {
			specimens.push(_this.experiment.getSampleById(measurements[i].specimenId));
		}
		_this.measurementSamplePlateGroupWidget.selectSpecimens(specimens);
	});

	/** AnalysisGrid * */
	this.analysisGrid = new AnalysisGrid({
		height : Ext.getBody().getViewSize().height * 0.9 - 300,
		positionColumnsHidden : true,
		sorters : [ {
			property : 'priorityLevelId',
			direction : 'ASC'
		} ]
	});

//	this.concentrationEffectGrid = new AnalysisGrid({
//		height : 600,
//		positionColumnsHidden : true
//	});
}

//ExperimentTabs.prototype.refresh = function(experiment) {
//	var start = new Date().getTime();
//	this.experiment = experiment;
//	this.experiment.onSaved = new Event(this);
//	this.experiment.onSpecimenSaved = new Event(this);
//	/** Refreshing grids * */
//	
//	this.analysisGrid.refresh(new ExperimentList([ this.experiment ]));
//	this.concentrationEffectGrid.refresh(new ExperimentList([ this.experiment ]));
//
//	this.panel.setLoading(false);
//
//	var end = new Date().getTime();
//	var time = end - start;
//	console.log('Execution time refresh: ' + time);
//
//};

ExperimentTabs.prototype.error = function(error) {
	var e = JSON.parse(error);
	showError(e);
	this.panel.setLoading(false);
};

ExperimentTabs.prototype.draw = function(experiment) {
	this.renderDataAcquisition(experiment);
};

ExperimentTabs.prototype.refreshAnalysisData = function() {
	var _this = this;
	var adapter = new BiosaxsDataAdapter();
	adapter.onSuccess.attach(function(sender, data) {
		_this.analysisGrid.refresh(data, {experiment : _this.experiment});
	});
	adapter.getAnalysisInformationByExperimentId(this.experiment.experimentId);
};

ExperimentTabs.prototype.getSpecimenContainerHeight = function(experiment) {
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

ExperimentTabs.prototype.getExperimentTitle = function() {
	var experimentHeaderForm = new ExperimentHeaderForm();
	return experimentHeaderForm.getPanel(this.experiment);
};

ExperimentTabs.prototype.renderDataAcquisition = function(experiment) {
	var _this = this;
	this.experiment = experiment;

	var specimenGrid = new SpecimenGrid({
		height : 400,
		maxHeight : 500,
		width : 890
	});

	specimenGrid.onClick.attach(function(sender, args) {
	});

	specimenGrid.onSelected.attach(function(sender, specimens) {
		_this.samplePlateGroupWidget.selectSpecimens(specimens);
	});

	var specimenContainer = Ext.create('Ext.container.Container', {
		layout : 'hbox',
		width : 900,
		padding : '10 0 0 2',
		items : [ specimenGrid.getPanelByExperiment(experiment) ]
	});

	var experimentList = new ExperimentList([ _this.experiment ]);
	var measurementContainer = Ext.create('Ext.container.Container', {
		layout : 'vbox',
		padding : '5px 0px 0px 10px',
		items : []
	});
	measurementContainer.insert(0, _this.measurementGridDone.getPanel(this.experiment.getMeasurements(), experimentList));
	measurementContainer.insert(1, _this.measurementSamplePlateGroupWidget.getPanel(experiment));

	// this.dataCollectionCurveVisualizer = new DataCollectionCurveVisualizer();
	// this.dataCollectionCurveVisualizer.experiments = [experiment];
	// this.dataCollectionCurveVisualizer.dataCollectionFrameTree.experiments =
	// [experiment];
	// this.dataCollectionCurveVisualizer.dataCollections =
	// experiment.getDataCollections();

	this.panel = Ext.createWidget('tabpanel', {
		plain : true,
		style : {
			padding : 2
		},
		items : [ {
			tabConfig : {
				id : 'genralTabl',
				title : "Overview"

			},
			items : [ {
				xtype : 'container',
				layout : 'vbox',
				border : 1,
				height : _this.gridHeight,
				flex : 1,
				items : [ specimenContainer, {
					xtype : 'container',
					defaults : {
						style : {
							padding : '1px'
						}
					},
					items : [ this.samplePlateGroupWidget.getPanel(experiment) ]
				} ]
			} ]
		}, {
			tabConfig : {
				title : 'Measurements'
			},
			items : [ {
				xtype : 'container',
				layout : 'vbox',
				border : 1,
				height : 1400,
				flex : 1,
				items : [ measurementContainer ]
			}

			]
		}, {
			tabConfig : {
				id : 'SpecimenTab',
				title : 'Analysis',
				hidden : this.isTemplate()
			},
			items : [ {
				xtype : 'container',
				layout : 'vbox',
				padding : '5px 0px 10px 10px',
				items : [ _this.analysisGrid.getPanel([]) ]
			} ]
		}
		// ,
		// {
		// tabConfig : {
		// title : "1D Viewer",
		// hidden : this.isTemplate()
		// },
		// items : [
		// this.dataCollectionCurveVisualizer.getPanel(_this.experiment)
		// ]
		// }
		]
	});

	return this.getPanel(this.panel);
};

ExperimentTabs.prototype.isTemplate = function() {
	if (this.experiment.json.type == "TEMPLATE") {
		return true;
	}
	return false;
};

ExperimentTabs.prototype.update = function() {
	var _this = this;
	var inter;
	if (!_this.isTemplate()) {
		function updateExperiments() {
			console.log("Updating ");
			_this.refreshAnalysisData();
			window.clearInterval(inter);
			inter = setInterval(function() {
				updateExperiments();
			}, _this.INTERVAL_UPDATE);
			var adapter = new BiosaxsDataAdapter();
			adapter.onSuccess.attach(function(sender, data) {
				var experiment = new Experiment(data);
				_this.measurementGridDone.refresh(experiment.getMeasurements(), new ExperimentList([ experiment ]));
			});
			adapter.getExperimentById(_this.experiment.json.experimentId, "MEDIUM");
		}
		inter = setInterval(function() {
			updateExperiments();
		}, _this.INTERVAL_UPDATE);
	}
};

ExperimentTabs.prototype.getPanel = function(panel) {
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
				afterrender : function() {
					_this.refreshAnalysisData();
					_this.update();
				}
			}
		});
	}

	return this.experimentPanel;
};

ExperimentTabs.prototype.input = function() {
	return {
		proposal : new MeasurementGrid().input().proposal,
		experiment : {
			"experimentId" : 1137,
			"name" : "MG386_2.xml",
			"creationDate" : "Jul 17, 2013 5:08:37 PM",
			"sourceFilePath" : "/data/pyarch/bm29/opd29/1137/MG386_2.xml",
			"type" : "STATIC",
			"comments" : "[BsxCube] Generated from BsxCube",
			"dataAcquisitionFilePath" : "/data/pyarch/bm29/opd29/1137/1137.zip",
			"status" : "FINISHED",
			"proposalId" : 10,
			"samplePlate3VOs" : [ {
				"samplePlateId" : 3409,
				"platetype3VO" : {
					"plateTypeId" : 4,
					"name" : "96 Well plate",
					"description" : null,
					"rowCount" : 8,
					"columnCount" : 12,
					"shape" : "REC"
				},
				"instructionSet3VO" : null,
				"plategroup3VO" : {
					"plateGroupId" : 1137,
					"storageTemperature" : "20.0",
					"name" : "BsxCube Group 1"
				},
				"boxId" : null,
				"name" : "96 Well plate",
				"slotPositionRow" : "1",
				"slotPositionColumn" : "3",
				"storageTemperature" : "20.0",
				"sampleplateposition3VOs" : [],
				"experimentId" : 1137
			}, {
				"samplePlateId" : 3411,
				"platetype3VO" : {
					"plateTypeId" : 1,
					"name" : "Deep Well",
					"description" : null,
					"rowCount" : 8,
					"columnCount" : 12,
					"shape" : "REC"
				},
				"instructionSet3VO" : null,
				"plategroup3VO" : {
					"plateGroupId" : 1137,
					"storageTemperature" : "20.0",
					"name" : "BsxCube Group 1"
				},
				"boxId" : null,
				"name" : "Deep Well",
				"slotPositionRow" : "1",
				"slotPositionColumn" : "1",
				"storageTemperature" : "20.0",
				"sampleplateposition3VOs" : [],
				"experimentId" : 1137
			}, {
				"samplePlateId" : 3410,
				"platetype3VO" : {
					"plateTypeId" : 2,
					"name" : " 4 x ( 8 + 3 ) Block",
					"description" : null,
					"rowCount" : 4,
					"columnCount" : 11,
					"shape" : "REC"
				},
				"instructionSet3VO" : null,
				"plategroup3VO" : {
					"plateGroupId" : 1137,
					"storageTemperature" : "20.0",
					"name" : "BsxCube Group 1"
				},
				"boxId" : null,
				"name" : " 4 x ( 8 + 3 ) Block",
				"slotPositionRow" : "1",
				"slotPositionColumn" : "2",
				"storageTemperature" : "20.0",
				"sampleplateposition3VOs" : [ {
					"samplePlatePositionId" : 8512,
					"samplePlateId" : 3410,
					"rowNumber" : 1,
					"columnNumber" : 7,
					"volume" : null
				}, {
					"samplePlatePositionId" : 8513,
					"samplePlateId" : 3410,
					"rowNumber" : 1,
					"columnNumber" : 8,
					"volume" : null
				}, {
					"samplePlatePositionId" : 8511,
					"samplePlateId" : 3410,
					"rowNumber" : 1,
					"columnNumber" : 9,
					"volume" : null
				} ],
				"experimentId" : 1137
			} ],
			"platetype3VOs" : [ {
				"plateTypeId" : 4,
				"name" : "96 Well plate",
				"description" : null,
				"rowCount" : 8,
				"columnCount" : 12,
				"shape" : "REC"
			}, {
				"plateTypeId" : 3,
				"name" : "Disk Well plate",
				"description" : null,
				"rowCount" : 8,
				"columnCount" : 2,
				"shape" : "CIR"
			}, {
				"plateTypeId" : 2,
				"name" : " 4 x ( 8 + 3 ) Block",
				"description" : null,
				"rowCount" : 4,
				"columnCount" : 11,
				"shape" : "REC"
			}, {
				"plateTypeId" : 1,
				"name" : "Deep Well",
				"description" : null,
				"rowCount" : 8,
				"columnCount" : 12,
				"shape" : "REC"
			} ],
			"samples3VOs" : [ {
				"specimenId" : 8526,
				"macromolecule3VO" : null,
				"sampleplateposition3VO" : {
					"samplePlatePositionId" : 8511,
					"samplePlateId" : 3410,
					"rowNumber" : 1,
					"columnNumber" : 9,
					"volume" : null
				},
				"bufferId" : 707,
				"stockSolutionId" : null,
				"experimentId" : 1137,
				"safetyLevelId" : null,
				"concentration" : "0.0",
				"code" : "",
				"volume" : "75",
				"comments" : null,
				"measurements" : [ {
					"measurementId" : 22152,
					"specimenId" : 8526,
					"flow" : true,
					"priority" : 3,
					"exposureTemperature" : "20.0",
					"viscosity" : "Low",
					"extraFlowTime" : "10",
					"volumeToLoad" : "75",
					"comments" : "MESbuffer",
					"code" : "_20.0",
					"transmission" : "100.0",
					"waitTime" : "0.0",
					"run3VO" : {
						"runId" : 12611,
						"timePerFrame" : "1.0",
						"timeStart" : "2013-07-17 17:11:39.434973",
						"timeEnd" : "2013-07-17 17:12:53.944725",
						"storageTemperature" : "20.0",
						"exposureTemperature" : "20.04",
						"spectrophotometer" : "spectrophotometer",
						"energy" : "12.4996471418",
						"transmission" : "100.0",
						"beamCenterX" : "763",
						"beamCenterY" : "136",
						"pixelSizeX" : "172.0",
						"pixelSizeY" : "172.0",
						"radiationRelative" : "0",
						"radiationAbsolute" : "1e-50",
						"normalization" : null
					},
					"merge3VOs" : [ {
						"mergeId" : 12374,
						"framelist3VO" : {
							"_filter_signature" : [ -13, 121, 4 ],
							"serialVersionUID" : -1,
							"comments" : null,
							"frametolist3VOs" : []
						},
						"measurementId" : 22152,
						"discardedFrameNameList" : null,
						"averageFilePath" : " /data/pyarch/bm29/opd29/1137/1d/MG386_017_ave.dat",
						"framesCount" : "10",
						"framesMerge" : "10"
					} ],
					"dataCollectionOrder" : null
				}, {
					"measurementId" : 22155,
					"specimenId" : 8526,
					"flow" : true,
					"priority" : 5,
					"exposureTemperature" : "20.0",
					"viscosity" : "Low",
					"extraFlowTime" : "10",
					"volumeToLoad" : "75",
					"comments" : "MESbuffer",
					"code" : "_20.0",
					"transmission" : "100.0",
					"waitTime" : "0.0",
					"run3VO" : {
						"runId" : 12613,
						"timePerFrame" : "1.0",
						"timeStart" : "2013-07-17 17:14:10.359208",
						"timeEnd" : "2013-07-17 17:15:24.547522",
						"storageTemperature" : "20.0",
						"exposureTemperature" : "20.04",
						"spectrophotometer" : "spectrophotometer",
						"energy" : "12.4996471418",
						"transmission" : "100.0",
						"beamCenterX" : "763",
						"beamCenterY" : "136",
						"pixelSizeX" : "172.0",
						"pixelSizeY" : "172.0",
						"radiationRelative" : "0",
						"radiationAbsolute" : "1e-50",
						"normalization" : null
					},
					"merge3VOs" : [ {
						"mergeId" : 12376,
						"framelist3VO" : {
							"_filter_signature" : [ -13, 121, 4 ],
							"serialVersionUID" : -1,
							"comments" : null,
							"frametolist3VOs" : []
						},
						"measurementId" : 22155,
						"discardedFrameNameList" : null,
						"averageFilePath" : " /data/pyarch/bm29/opd29/1137/1d/MG386_019_ave.dat",
						"framesCount" : "10",
						"framesMerge" : "10"
					} ],
					"dataCollectionOrder" : null
				}, {
					"measurementId" : 22150,
					"specimenId" : 8526,
					"flow" : true,
					"priority" : 1,
					"exposureTemperature" : "20.0",
					"viscosity" : "Low",
					"extraFlowTime" : "10",
					"volumeToLoad" : "75",
					"comments" : "MESbuffer",
					"code" : "_20.0",
					"transmission" : "100.0",
					"waitTime" : "0.0",
					"run3VO" : {
						"runId" : 12609,
						"timePerFrame" : "1.0",
						"timeStart" : "2013-07-17 17:09:09.684852",
						"timeEnd" : "2013-07-17 17:10:24.069393",
						"storageTemperature" : "20.0",
						"exposureTemperature" : "20.04",
						"spectrophotometer" : "spectrophotometer",
						"energy" : "12.4996471418",
						"transmission" : "100.0",
						"beamCenterX" : "763",
						"beamCenterY" : "136",
						"pixelSizeX" : "172.0",
						"pixelSizeY" : "172.0",
						"radiationRelative" : "0",
						"radiationAbsolute" : "1e-50",
						"normalization" : null
					},
					"merge3VOs" : [ {
						"mergeId" : 12372,
						"framelist3VO" : {
							"_filter_signature" : [ -13, 121, 4 ],
							"serialVersionUID" : -1,
							"comments" : null,
							"frametolist3VOs" : []
						},
						"measurementId" : 22150,
						"discardedFrameNameList" : null,
						"averageFilePath" : " /data/pyarch/bm29/opd29/1137/1d/MG386_015_ave.dat",
						"framesCount" : "10",
						"framesMerge" : "10"
					} ],
					"dataCollectionOrder" : null
				} ],
				"macromoleculeId" : null
			}, {
				"specimenId" : 8528,
				"macromolecule3VO" : {
					"macromoleculeId" : 112,
					"safetylevelId" : null,
					"proposalId" : 10,
					"name" : "MG386",
					"acronym" : "MG386",
					"molecularMass" : null,
					"extintionCoefficient" : null,
					"sequence" : null,
					"creationDate" : null,
					"comments" : null,
					"stoichiometry3VOsForHostMacromoleculeId" : [],
					"structure3VOs" : []
				},
				"sampleplateposition3VO" : {
					"samplePlatePositionId" : 8513,
					"samplePlateId" : 3410,
					"rowNumber" : 1,
					"columnNumber" : 8,
					"volume" : null
				},
				"bufferId" : 707,
				"stockSolutionId" : null,
				"experimentId" : 1137,
				"safetyLevelId" : null,
				"concentration" : "0.65000000000000002",
				"code" : "",
				"volume" : "75",
				"comments" : null,
				"measurements" : [ {
					"measurementId" : 22154,
					"specimenId" : 8528,
					"flow" : true,
					"priority" : 4,
					"exposureTemperature" : "20.0",
					"viscosity" : "Low",
					"extraFlowTime" : "10",
					"volumeToLoad" : "75",
					"comments" : "[2] MES",
					"code" : "_20.0_0.65000000000000002",
					"transmission" : "100.0",
					"waitTime" : "0.0",
					"run3VO" : {
						"runId" : 12612,
						"timePerFrame" : "1.0",
						"timeStart" : "2013-07-17 17:12:55.837462",
						"timeEnd" : "2013-07-17 17:14:10.243329",
						"storageTemperature" : "20.0",
						"exposureTemperature" : "20.04",
						"spectrophotometer" : "spectrophotometer",
						"energy" : "12.4996471418",
						"transmission" : "100.0",
						"beamCenterX" : "763",
						"beamCenterY" : "136",
						"pixelSizeX" : "172.0",
						"pixelSizeY" : "172.0",
						"radiationRelative" : "0",
						"radiationAbsolute" : "1e-50",
						"normalization" : null
					},
					"merge3VOs" : [ {
						"mergeId" : 12375,
						"framelist3VO" : {
							"_filter_signature" : [ -13, 121, 4 ],
							"serialVersionUID" : -1,
							"comments" : null,
							"frametolist3VOs" : []
						},
						"measurementId" : 22154,
						"discardedFrameNameList" : null,
						"averageFilePath" : " /data/pyarch/bm29/opd29/1137/1d/MG386_018_ave.dat",
						"framesCount" : "10",
						"framesMerge" : "10"
					} ],
					"dataCollectionOrder" : null
				} ],
				"macromoleculeId" : null
			}, {
				"specimenId" : 8527,
				"macromolecule3VO" : {
					"macromoleculeId" : 112,
					"safetylevelId" : null,
					"proposalId" : 10,
					"name" : "MG386",
					"acronym" : "MG386",
					"molecularMass" : null,
					"extintionCoefficient" : null,
					"sequence" : null,
					"creationDate" : null,
					"comments" : null,
					"stoichiometry3VOsForHostMacromoleculeId" : [],
					"structure3VOs" : []
				},
				"sampleplateposition3VO" : {
					"samplePlatePositionId" : 8512,
					"samplePlateId" : 3410,
					"rowNumber" : 1,
					"columnNumber" : 7,
					"volume" : null
				},
				"bufferId" : 707,
				"stockSolutionId" : null,
				"experimentId" : 1137,
				"safetyLevelId" : null,
				"concentration" : "1.25",
				"code" : "",
				"volume" : "75",
				"comments" : null,
				"measurements" : [ {
					"measurementId" : 22151,
					"specimenId" : 8527,
					"flow" : true,
					"priority" : 2,
					"exposureTemperature" : "20.0",
					"viscosity" : "Low",
					"extraFlowTime" : "10",
					"volumeToLoad" : "75",
					"comments" : "[1] MES",
					"code" : "_20.0_1.25",
					"transmission" : "100.0",
					"waitTime" : "0.0",
					"run3VO" : {
						"runId" : 12610,
						"timePerFrame" : "1.0",
						"timeStart" : "2013-07-17 17:10:25.743734",
						"timeEnd" : "2013-07-17 17:11:39.319728",
						"storageTemperature" : "20.0",
						"exposureTemperature" : "20.04",
						"spectrophotometer" : "spectrophotometer",
						"energy" : "12.4996471418",
						"transmission" : "100.0",
						"beamCenterX" : "763",
						"beamCenterY" : "136",
						"pixelSizeX" : "172.0",
						"pixelSizeY" : "172.0",
						"radiationRelative" : "0",
						"radiationAbsolute" : "1e-50",
						"normalization" : null
					},
					"merge3VOs" : [ {
						"mergeId" : 12373,
						"framelist3VO" : {
							"_filter_signature" : [ -13, 121, 4 ],
							"serialVersionUID" : -1,
							"comments" : null,
							"frametolist3VOs" : []
						},
						"measurementId" : 22151,
						"discardedFrameNameList" : null,
						"averageFilePath" : " /data/pyarch/bm29/opd29/1137/1d/MG386_016_ave.dat",
						"framesCount" : "10",
						"framesMerge" : "10"
					} ],
					"dataCollectionOrder" : null
				} ],
				"macromoleculeId" : null
			} ],
			"dataCollections" : [ {
				"dataCollectionId" : 7385,
				"measurementtodatacollection3VOs" : [ {
					"measurementToDataCollectionId" : 22153,
					"measurementId" : 22152,
					"dataCollectionOrder" : 1
				}, {
					"measurementToDataCollectionId" : 22155,
					"measurementId" : 22155,
					"dataCollectionOrder" : 3
				}, {
					"measurementToDataCollectionId" : 22154,
					"measurementId" : 22154,
					"dataCollectionOrder" : 2
				} ],
				"experimentId" : 1137,
				"substraction3VOs" : [ {
					"subtractionId" : 5166,
					"dataCollectionId" : 7385,
					"rg" : "2.95541",
					"rgStdev" : "0.125183",
					"i0" : "31.4366153846",
					"i0stdev" : "0.100250461538",
					"firstPointUsed" : "21",
					"lastPointUsed" : "80",
					"quality" : "0.870164",
					"isagregated" : "False",
					"concentration" : null,
					"rgGuinier" : "2.95541",
					"rgGnom" : "2.9963404542",
					"dmax" : "10.343935",
					"total" : "0.582641941147",
					"volume" : "42.2255",
					"creationTime" : "Jul 17, 2013 5:15:02 PM",
					"gnomFilePath" : "/data/pyarch/bm29/opd29/1137/1d/MG386_018_sub-density.png",
					"kratkyFilePath" : "/data/pyarch/bm29/opd29/1137/1d/MG386_018_sub-Kratky.png",
					"scatteringFilePath" : "/data/pyarch/bm29/opd29/1137/1d/MG386_018_sub-scattering.png",
					"guinierFilePath" : "/data/pyarch/bm29/opd29/1137/1d/MG386_018_sub-Guinier.png",
					"substractedFilePath" : " /data/pyarch/bm29/opd29/1137/1d/MG386_018_sub.dat",
					"gnomFilePathOutput" : " /data/pyarch/bm29/opd29/1137/1d/MG386_018_sub.out"
				} ],
				"comments" : null
			}, {
				"dataCollectionId" : 7384,
				"measurementtodatacollection3VOs" : [ {
					"measurementToDataCollectionId" : 22150,
					"measurementId" : 22150,
					"dataCollectionOrder" : 1
				}, {
					"measurementToDataCollectionId" : 22152,
					"measurementId" : 22152,
					"dataCollectionOrder" : 3
				}, {
					"measurementToDataCollectionId" : 22151,
					"measurementId" : 22151,
					"dataCollectionOrder" : 2
				} ],
				"experimentId" : 1137,
				"substraction3VOs" : [ {
					"subtractionId" : 5165,
					"dataCollectionId" : 7384,
					"rg" : "2.96883",
					"rgStdev" : "0.0455043",
					"i0" : "32.50776",
					"i0stdev" : "0.05726128",
					"firstPointUsed" : "30",
					"lastPointUsed" : "92",
					"quality" : "0.87091",
					"isagregated" : "False",
					"concentration" : null,
					"rgGuinier" : "2.96883",
					"rgGnom" : "3.05242714339",
					"dmax" : "10.390905",
					"total" : "0.447505552082",
					"volume" : "44.1406",
					"creationTime" : "Jul 17, 2013 5:12:32 PM",
					"gnomFilePath" : "/data/pyarch/bm29/opd29/1137/1d/MG386_016_sub-density.png",
					"kratkyFilePath" : "/data/pyarch/bm29/opd29/1137/1d/MG386_016_sub-Kratky.png",
					"scatteringFilePath" : "/data/pyarch/bm29/opd29/1137/1d/MG386_016_sub-scattering.png",
					"guinierFilePath" : "/data/pyarch/bm29/opd29/1137/1d/MG386_016_sub-Guinier.png",
					"substractedFilePath" : " /data/pyarch/bm29/opd29/1137/1d/MG386_016_sub.dat",
					"gnomFilePathOutput" : " /data/pyarch/bm29/opd29/1137/1d/MG386_016_sub.out"
				} ],
				"comments" : null
			} ]
		}
	};
};

ExperimentTabs.prototype.test = function(targetId) {
	var experimentTabs = new ExperimentTabs(targetId);
	BIOSAXS.proposal = new Proposal(experimentTabs.input().proposal);
	experimentTabs.draw(new Experiment(experimentTabs.input().experiment));
};
