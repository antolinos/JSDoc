DataCollectionCurveVisualizer.prototype.getButtons = GenericWindow.prototype.getButtons; 
DataCollectionCurveVisualizer.prototype._render = GenericWindow.prototype._render; 
DataCollectionCurveVisualizer.prototype._postRender = GenericWindow.prototype._postRender; 

function DataCollectionCurveVisualizer(args){
	  this.width = 1000;
      this.height = 650;
      
      
      
      this.labelsWidth = 120;
      this.graphHeight =  this.height - 50;
      this.columnNameWidth = 220;
      this.graphWidth =  this.width - this.columnNameWidth - 80;
      
      this.predefinedColors = ["#E41A1C", "4DAF4A", "984EA3", "A65628", "FF7F00", "F781BF"];
      this.macromoleculeColors = [];
      
      this.id = BUI.id();

       if (args != null){
          if (args.actions != null){
             this.actions = args.actions;
          }
       }
       
       this.operation = "LOG"; //"LOG"
		
		
       var _this = this;
       
       this.form = this;
       GenericWindow.prototype.constructor.call(this, {form:this, title: "1D Scattering Curves Visualizer", width:this.width, height:this.height});
       
       this.dataCollectionFrameTree =  new DataCollectionFrameTree({height: this.height});
       
       /** Update graph **/
       this.dataCollectionFrameTree.onSelectionChanged.attach(function(sender, args){
    	  var dataAdapter = new BiosaxsDataAdapter();
      	 dataAdapter.onSuccess.attach(function(sender, dataMatrix){
      		 _this.panel.setLoading("Rendering");
				
      		 _this.drawVisualization(_this.prepareDataForGraph(dataMatrix, args.framesHash, args.labelsHash));
      		 _this.panel.setLoading(false);
      	 });
      	 
      	 
      	 dataAdapter.onError.attach(function(sender, dataMatrix){
      		 _this.panel.setLoading(false);
      	 });
      	 
      	 if (args.ids.length > 0 ){
      		 _this.panel.setLoading("ISPyB: Retrieving 1D curves");
      		 dataAdapter.getScatteringCurveByFrameIdsList(args.ids);
      	 }
    	   
       });
       
       
       this.onDataRetrieved = new Event();
       
 };



DataCollectionCurveVisualizer.prototype.draw = function (experiments, dataCollections){
	this.experiments = experiments;
	this.dataCollectionFrameTree.experiments = experiments;
	this.dataCollections = dataCollections;
	
	this._render();
};


DataCollectionCurveVisualizer.prototype.visualizeFrames = function (frameIdsList){
	var _this = this;
	 var dataAdapter = new BiosaxsDataAdapter();
	 this.panel.setLoading("Rendering");
//	 dataAdapter.onSuccess.attach(function(sender, dataMatrix){
//		 debugger
//		 _this.drawVisualization(_this.prepareDataForGraph(dataMatrix));
		 _this.panel.setLoading(false);
//	 });
//	 debugger
//	 dataAdapter.getScatteringCurveByFrameIdsList(frameIdsList);
};








DataCollectionCurveVisualizer.prototype.getFramesFromDataBase = function (dataCollections){
	var _this = this;
	
	var mergeIds = new Array();
	for ( var dc = 0; dc < dataCollections.length; dc++) {
		 	var dataCollection = dataCollections[dc];
		 	for (var i = 0; i < dataCollection.measurementtodatacollection3VOs.length; i++){
				var specimen = this.dataCollectionFrameTree.getSpecimenById(dataCollection.measurementtodatacollection3VOs[i].measurementId);
				if(specimen.merge3VOs[0] != null){
					mergeIds.push(specimen.merge3VOs[0].mergeId);
				}
			}
	 }
	
	var dataAdapter = new BiosaxsDataAdapter();
	dataAdapter.onSuccess.attach(function(sender, merges){
			if (_this.dataCollectionFrameTree != null){
				_this.merges = merges;
				_this.dataCollectionFrameTree.loadDatacollections(dataCollections, _this.merges);
			}
			
			_this.onDataRetrieved.notify();
			_this.panel.setLoading(false);
	});
	
	dataAdapter.onError.attach(function(sender, error){
		_this.panel.setLoading(false);
		showError(error);
	});
	if (mergeIds.length > 0){
		this.panel.setLoading("ISPyB: Retrieving 1D curves");
		if (mergeIds.length < 30){
			dataAdapter.getMergesByIdsList(mergeIds);
		}
		else{
			dataAdapter.getMergesByIdsList(mergeIds.slice(0,30));
		}
	}
};

DataCollectionCurveVisualizer.prototype.getFilesPanel = function (){
	return this.dataCollectionFrameTree.getPanel();//this.getTree();//this.dataCollectionFrameTree;
};


DataCollectionCurveVisualizer.prototype.getGraphPanelId = function (){
	return this.id + "graphPanel";
};

DataCollectionCurveVisualizer.prototype.getGraphPanel = function (){
	var _this = this;
	return {
		id 			: _this.getGraphPanelId(),
        xtype		: 'container',
   	 	margin		: '0 0 10 10 ',
   	 	border		: false,
        layout		: 'vbox',
        items		: [
		                	{
		                		html:"<div id = '" + this.id + "_dygraphs' style='width:" + _this.graphWidth + "px;height:" +_this.graphHeight + "px;'></div>"
	                		}
						]
	};
};

DataCollectionCurveVisualizer.prototype.getGraphControls =  function() {
return {
        xtype: 'container',
        layout: 'hbox',
        margin: '0 0 10 0 ',
        width : 400,
        items: [
        {
            xtype: 'fieldset',
            title: 'Options',
            defaultType: 'radio', // each item will be a radio button
            layout: 'vbox',
            defaults: {
                hideEmptyLabel: false
            },
            items: [ {
                fieldLabel: 'Display',
                boxLabel: '1D Value',
                name: 'value',
                inputValue: 'value',
                listeners:{
   		         'change': function(model, newValue,  eOpts){
   		        	if (newValue){
   		        		_this.operation = "VALUE";
   		        	}
   		        	else{
   		        		_this.operation = "LOG";
   		        	}
   		         }
                }
            }, {
                boxLabel: 'Log',
                checked: true,
                name: 'value',
                inputValue: 'log'
            }]
        }]
    };
};

DataCollectionCurveVisualizer.prototype.drawVisualization =  function(data) {
	try{
		var dygraphWidget = new DygraphWidget(this.id + '_dygraphs', 'dygraphLabels', {width: this.graphWidth, height:this.graphHeight, labelsWidth:this.labelsWidth});
		dygraphWidget.draw(data, this.colors, this.labels);
	}
	catch(e){
		console.log(e);
	}
};


DataCollectionCurveVisualizer.prototype.getColor =  function(macromolecule) {
	//TODOthis.dataCollectionFrameTree.getSampleById(framesId[key].specimenId)
//	if (this.macromoleculeColors[macromolecule.acronym] == null){
//		var c = 0;
//		for ( var key in this.macromoleculeColors){
//			c = c + 1;
//		}
//		this.macromoleculeColors[macromolecule.acronym] = this.predefinedColors[c % this.predefinedColors.length];
//	}
//	return this.macromoleculeColors[macromolecule.acronym] ;
	return BIOSAXS.proposal.macromoleculeColors[macromolecule.macromoleculeId];
	
};

DataCollectionCurveVisualizer.prototype.prepareDataForGraph =  function(dataMatrix, framesId, labelsId) {
	this.colors = new Array();
	this.labels = ["Intensity"];
	
	this.data = new Array();
	if (dataMatrix[0] != null){
		 for ( var key in dataMatrix[0]){
			 
			 	if (framesId[key].macromolecule3VO == null){
			 		if (labelsId[key].indexOf("_ave.dat") != -1){
						this.colors.push(BUI.getBufferColor());
					}
					else{
						this.colors.push(BUI.getLightBufferColor());
					}
				}
				else{
					if (labelsId[key].indexOf("_ave.dat") != -1){
						this.colors.push(this.getColor(framesId[key].macromolecule3VO));
					}
					else{
						this.colors.push(BUI.getLightSampleColor());
					}
				}
			
			 this.labels.push(labelsId[key]);
			 for ( var frameId in dataMatrix[0][key]){
					var row = dataMatrix[0][key][frameId];
//					this.data.push([this.getValue(row[0]),this.getValue(row[1])]);
					/** Log(y) ad linear for x **/
					this.data.push([parseFloat(row[0]),this.getValue(row[1])]);
			 }
		}
	}
	
	for ( var i = 1; i < dataMatrix.length; i++) {
		var j = 0;
		 for ( var key in dataMatrix[i]){
				if (framesId[key].macromolecule3VO == null){
					if (labelsId[key].indexOf("_ave.dat") != -1){
						this.colors.push(BUI.getBufferColor());
					}
					else{
						this.colors.push("red");
//						this.colors.push(BUI.getLightBufferColor());
					}
					
				}
				else{
					if (labelsId[key].indexOf("_ave.dat") != -1){
						this.colors.push(this.getColor(framesId[key].macromolecule3VO));
//						this.colors.push(BUI.getSampleColor());
					}
					else{
						this.colors.push("red");
//						this.colors.push(BUI.getLightSampleColor());
					}
				}
				 this.labels.push(labelsId[key]);
			 for ( var frameId in dataMatrix[i][key]){
					var row = dataMatrix[i][key][frameId];
					if (this.data[j] != null){
						this.data[j].push(this.getValue(row[1]));
					}
					j ++;
					
				
			 }
		}
	}
	
	return this.data;

  }

DataCollectionCurveVisualizer.prototype.getValue = function (value){
	if (this.operation == "LOG"){
		return Math.log(parseFloat(value));
	}
	return parseFloat(value); 
};


DataCollectionCurveVisualizer.prototype.getPanel = function (experiment){
	this.experiment = experiment;
	var _this = this;
	this.panel =  Ext.create('Ext.form.Panel', {
			id 	: this.id + 'main', 
	        bodyStyle: 'padding:5px 5px 5px  5px',
	        border	: 0,
	        height	: this.height,
	        width 	: this.width,
	        layout: {
	            type: 'table',
	            columns: 3
	        },

	        layout: 'hbox',
	        items: [
	                this.getFilesPanel(),
	                this.getGraphPanel()
	                ]
	    });
	
	this.panel.on("afterrender", function(){
		_this.getFramesFromDataBase(_this.dataCollections);
	});
	 
	
	 return this.panel;
};











/**
 * 
 * DataCollectionFrameTree
 * 
 * 
 */
function DataCollectionFrameTree(args){
	this.height = 100;
	
	if (args != null){
		if (args.height != null){
			this.height = args.height;
		}
	}
	this.id = BUI.id();

    this.framesIdToVisualize = new Array();
    this.framesId = new Object();
	this.labelsId = new Object();
	
	
	/** Events **/
	this.onSelectionChanged = new Event();
};




DataCollectionFrameTree.prototype.getPanel = function (){
	
//	var mg =  new MacromoleculeGrid_v2().getPanel(this.experiments[0]); //this.getMacromoleculeGrid();
	 
		return {
			id					: this.id ,
	        title				:'Criteria',
	        split				:true,
	        width 				: 250,
	        minHeight			: 550,
	        collapsible			: true,
	        collapseDirection	: Ext.Component.DIRECTION_LEFT,
	        margins				:'0 5 5 0',
	        layout				:'accordion',
	        height				: this.height - 90,
	       
	        layoutConfig:{
	            				animate	:	true
	        },
	        items: [{
	            title			:	'List',
	            autoScroll		: true,
	            border			: false,
	            items			:[
	                 			  	this.getListGrid()
	                 			  ]
	        },{
	            title			:	'Macromolecules',
	            autoScroll		: true,
	            border			: false,
	            items			:[
	                 			  	this.getMacromoleculeGrid()
	                 			  ]
	        },{
	            title			:'Tree',
	            border			:false,
	            autoScroll		:true,
	            items			:[
	               			  		this.getFramesTree()
	               			  	]
	        }]
	    }
};

/** Macromolecule Grid **/
DataCollectionFrameTree.prototype.getListGrid = function() {
	var _this = this;
	this.listStore = Ext.create('Ext.data.Store', {
		fields		:  [ 'frameId', 'filePath'],
		autoload	: false
	});
	  
	this.listStore.sort('filePath');
	this.listGrid = Ext.create('Ext.grid.Panel', {
		id			: 'listGrid' + this.id, 
	    store		: this.listStore,
		    columns: [
		              {
							 text			: 'File',  
							 dataIndex		: 'filePath',
							 flex			:1,
							 renderer		: function(val){
								 				return val.split("/")[val.split("/").length - 1];
								 
							 }
						 }
		          ],
	    columnLines			: true,
	    multiSelect			: true,
	    flex				: 1,
	    border				: 0,
	    listeners:{
		         'selectionchange': function(model, selected,  eOpts){
		        	 var selectedFrames = new Array();
		        	 for ( var i = 0; i < selected.length; i++) {
		        		 selectedFrames.push(selected[i].data.frameId);
					}
		        	 _this.notifySelectionChanged(selectedFrames);
		         }
		    }
	});
	return this.listGrid;
};


/** Macromolecule Grid **/
DataCollectionFrameTree.prototype.getMacromoleculeGrid = function() {
	var _this = this;
	this.macromoleculeStore = Ext.create('Ext.data.Store', {
		fields		:  [ 'acronym', 'macromoleculeId'],
		autoload	: false
	});
	  
	this.macromoleculeGrid = Ext.create('Ext.grid.Panel', {
		id			: 'macromoleculeGrid' + this.id, 
	    store		: this.macromoleculeStore,
		    columns: [
		              {
							 text			: '',  
							 dataIndex		: 'macromoleculeId',
							 width 			: 20,
							 renderer 		:   function(val, y, sample){
												return BUI.getRectangleColorDIV(_this.experiments[0].macromoleculeColors[val], 10, 10);
							}
						 },
		              {text: "Acronym", flex: 1, sortable: true, dataIndex: 'acronym'}
		          ],
	    columnLines			: true,
	    multiSelect				: true,
	    flex				: 1,
	    border				: 0,
	    listeners:{
		         'selectionchange': function(model, selected,  eOpts){
		        	 var macromoleculesSelectHash = new Object();
		        	 for ( var i = 0; i < selected.length; i++) {
		        		 macromoleculesSelectHash[selected[i].data.macromoleculeId] = selected[i].data;
					}
		        	 var selectedFrames = new Array();
		        	 for (var key in _this.framesId){ 
		        		 if (_this.framesId[key].macromolecule3VO != null){
			        		 if (macromoleculesSelectHash[_this.framesId[key].macromolecule3VO.macromoleculeId] != null){
			        			 
			        			 /** Only averagefiles **/
			        			 if (_this.labelsId[key].indexOf("ave.dat")!= -1){
			        				 selectedFrames.push(key);
			        			 }
			        		 }
		        		 }
		        	 }
		        	 
		        	 _this.notifySelectionChanged(selectedFrames);
		         }
		    }
	});
	return this.macromoleculeGrid;
};


DataCollectionFrameTree.prototype.getDataCollectionCode = function (dataCollection){
	var code = "";
	for (var i = 0; i < dataCollection.measurementtodatacollection3VOs.length; i++){
		var sample =  this.getSampleById(this.getSpecimenById(dataCollection.measurementtodatacollection3VOs[i].measurementId).specimenId);
		if (sample.macromolecule3VO != null){
			return sample.macromolecule3VO.acronym;// + ":  " + parseFloat(sample.concentration).toFixed(2) + " mg/ml";
		}
	}
	return code;
};


DataCollectionFrameTree.prototype.getCollectionNode = function (dataCollection, merges){
	return   {
        File			: this.getDataCollectionCode(dataCollection),
        expanded		: true,
        children		: this.getMeasurements(dataCollection, merges)
	};
};

DataCollectionFrameTree.prototype.getData = function (dataCollections, merges){
	var treeData = new Array();
	 for ( var i = 0; i < dataCollections.length; i++) {
		 	dataCollection = dataCollections[i];
		 	treeData.push(this.getCollectionNode(dataCollection, merges));
	 }
	 
	return treeData;
};


DataCollectionFrameTree.prototype.getMeasurements = function (dataCollection, merges){
	var children = new Array();
	for (var i = 0; i < dataCollection.measurementtodatacollection3VOs.length; i++){
		var sample =  this.getSampleById(this.getSpecimenById(dataCollection.measurementtodatacollection3VOs[i].measurementId).specimenId);
		var code = "BUFFER";
		if (sample.macromolecule3VO != null){
			code = sample.macromolecule3VO.acronym + ":  " + parseFloat(sample.concentration).toFixed(2) + " mg/ml";
		}
		else{
			code = this.getBufferById(sample.bufferId).acronym;
		}
		var childrenFrames = this.getFrames(dataCollection.measurementtodatacollection3VOs[i].measurementId, merges);
		if (childrenFrames.length > 0){
				/** Removing if there are no frames **/
				var childrenFiltered = new Array();
				for ( var j = 0; j < childrenFrames.length; j++) {
					if (childrenFrames[j].children != null){
						if (childrenFrames[j].children.length > 0){
							childrenFiltered.push(childrenFrames[j]);
						}
					}
					else{
						childrenFiltered.push(childrenFrames[j]);
					}
				}
				
				children.push({
							        File				: code,
							        dataCollectionOrder	: dataCollection.measurementtodatacollection3VOs[i].dataCollectionOrder,
							        expanded			: false,
							        children			: childrenFiltered,
							        frameId				: null
				});
		}
	}
	return children;
};

DataCollectionFrameTree.prototype.getFrames = function (measurementId, merges){
	var data = new Array();
	if (merges != null){
		for ( var i = 0; i < merges.length; i++) {
			if (merges[i].measurementId == measurementId){
				for (var f = 0; f < merges[i].framelist3VO.frametolist3VOs.length; f++){
					var fileName = merges[i].framelist3VO.frametolist3VOs[f].frame3VO.filePath.split("/")[merges[i].framelist3VO.frametolist3VOs[f].frame3VO.filePath.split("/").length - 1];
					this.framesId[merges[i].framelist3VO.frametolist3VOs[f].frame3VO.frameId] = this.getSampleById(this.getSpecimenById(measurementId).specimenId);
					this.labelsId[merges[i].framelist3VO.frametolist3VOs[f].frame3VO.frameId] = fileName;
					if (fileName.indexOf("_ave.dat") != -1){
						data.push( 
								{
									File			: fileName,
							        frameId			: merges[i].framelist3VO.frametolist3VOs[f].frame3VO.frameId,
							        id				: merges[i].framelist3VO.frametolist3VOs[f].frame3VO.frameId,
							        expanded		: true,
							        leaf			: true
								});
						this.framesIdToVisualize.push(merges[i].framelist3VO.frametolist3VOs[f].frame3VO.frameId);
					}
				}
			}
		}
		data.push( 
				{
					File			: "Frames",
					children		: this.getFramesNoAverage(measurementId, merges),
			        expanded		: false,
			        leaf			: false
				});
		
	}
	return data;
};



DataCollectionFrameTree.prototype.getFramesNoAverage = function (measurementId, merges){
	var data = new Array();
	if (merges != null){
		for ( var i = 0; i < merges.length; i++) {
			if (merges[i].measurementId == measurementId){
				for (var f = 0; f < merges[i].framelist3VO.frametolist3VOs.length; f++){
					var fileName = merges[i].framelist3VO.frametolist3VOs[f].frame3VO.filePath.split("/")[merges[i].framelist3VO.frametolist3VOs[f].frame3VO.filePath.split("/").length - 1];
					this.framesId[merges[i].framelist3VO.frametolist3VOs[f].frame3VO.frameId] = this.getSampleById(this.getSpecimenById(measurementId).specimenId);
					this.labelsId[merges[i].framelist3VO.frametolist3VOs[f].frame3VO.frameId] = fileName;
					
					if (fileName.indexOf("_ave.dat") == -1){
						data.push( 
								{
									File			: fileName,
							        frameId			: merges[i].framelist3VO.frametolist3VOs[f].frame3VO.frameId,
							        id				: merges[i].framelist3VO.frametolist3VOs[f].frame3VO.frameId,
							        expanded		: false,
							        leaf			: true
								});
					}
					
					
				}
			}
		}
	}
	return data;
};


DataCollectionFrameTree.prototype.loadDatacollections = function (dataCollections, merges){
	var macromolecules = new Array();
	var macromoleculesHash = new Array();
	for (var i = 0 ; i < merges.length; i++){
		var macromolecule = this.getSampleById(this.getSpecimenById(merges[i].measurementId).specimenId).macromolecule3VO;
		if (macromolecule != null){
			if (macromoleculesHash[macromolecule.acronym] == null){
				macromolecules.push(macromolecule);
				macromoleculesHash[macromolecule.acronym] = true;
			}
		}
	}
	this.macromoleculeStore.loadData(macromolecules);
	
	this.store.getRootNode().removeAll();
	this.store.getRootNode().appendChild(this.getData(dataCollections, merges));
	

	var frames = new ExperimentList().getFrames(merges);
	this.listStore.loadData(frames);
};

DataCollectionFrameTree.prototype.getDataCollectionById = function (dataCollectionId){
	for ( var i = 0; i < this.experiments.length; i++) {
		var dataCollection = this.experiments[i].getDataCollectionById(dataCollectionId)
		if (dataCollection != null){
			return dataCollection;
		}
	}
	return null;
};

DataCollectionFrameTree.prototype.getSpecimenById = function (specimenId){
	for ( var i = 0; i < this.experiments.length; i++) {
		var specimen = this.experiments[i].getMeasurementById(specimenId)
		if (specimen != null){
			return specimen;
		}
	}
	return null;
};

DataCollectionFrameTree.prototype.getBufferById = function (bufferId){
	for ( var i = 0; i < this.experiments.length; i++) {
		var buffer = this.experiments[i].getBufferById(bufferId)
		if (buffer != null){
			return buffer;
		}
	}
	return null;
};

DataCollectionFrameTree.prototype.getSampleById = function (specimenId){
	for ( var i = 0; i < this.experiments.length; i++) {
		var sample = this.experiments[i].getSampleById(specimenId)
		if (sample != null){
			return sample;
		}
	}
	return null;
};

DataCollectionFrameTree.prototype.notifySelectionChanged = function (frameListSelectedIds){
	 this.onSelectionChanged.notify(
				{
					ids				: frameListSelectedIds,
					framesHash		: this.framesId,
					labelsHash		: this.labelsId
					
				}
			);
	
};

DataCollectionFrameTree.prototype.getFramesTree = function (){
	var _this = this;
		Ext.define('File', {
		    extend: 'Ext.data.Model',
		    fields: [
		        {name: 'dataCollectionOrder',       type: 'string'},
		        {name: 'File',     					type: 'string'},
		        {name: 'frameId',     				type: 'string'},
		        {name: 'id',     					type: 'string'}
		    ]
		});
		
		this.store = Ext.create('Ext.data.TreeStore', {
		    model: 'File',
		    root: {
				 expanded: true,
				 children: []
			},
			autoload : true
		});
		
		this.store.sort(
							[
							  {
									property : 'dataCollectionOrder',
								direction : 'ASC'
							},
							{
									property : 'File',
									direction : 'ASC'
							}]);
		
		this.tree =  Ext.create('Ext.tree.Panel', {
//		    width				: 225,
		    height				: '465',
		    minHeight				: '465',
		    selModel: {
		    	mode: 'MULTI',
		    	allowDeselect: true
		    }, 
		    allowDeselect		: true,
		    rootVisible			: false,
		    store				: this.store,
		    columns: [
		              {
					        xtype			: 'treecolumn', 
					        text			: 'Data Collections',
					        flex			: 2,
					        sortable		: true,
					        dataIndex		: 'File',
					        renderer 		: function(val, y, sample){
					        							if (sample.raw.frameId == null){
					        								return "<span style='font-size:small;'>" + val + "</span>";
					        							}
					        							
											        	if (val.indexOf("_ave.dat") != -1){
															return "<span style='font-weight:bold;'>" + val + "</span>";
														}
											        	return "<span style='font-size:x-small;'>" + val + "</span>";
					        }			
					    }
		    ],
		    listeners:{
		         'selectionchange': function(model, selected,  eOpts){
		        	 var frameIdsList = new Array();
		        	 for ( var i = 0; i < selected.length; i++) {
		        		 if (selected[i].data.frameId != null){
		        			 if (selected[i].data.frameId != null){
		        				 if (selected[i].data.frameId != ""){
		        					 frameIdsList.push(selected[i].data.frameId);
		        				 }
		        			 }
		        		 }
					}
		        		
		        	 if (frameIdsList.length > 0 ){
		        		 _this.notifySelectionChanged(frameIdsList);
		        	 }
		         }
		    }
		});
		
		return this.tree;
};



function DygraphWidget(targetId, labelsContainerId, args){
	  this.width = 1000;
      this.height = 600;
      this.labelsWidth = 100;
      this.targetId = targetId;
      this.labelsContainerId = labelsContainerId;
      
      
      this.id = BUI.id();
      
       if (args != null){
          if (args.width != null){
             this.width = args.width;
          }
          if (args.height != null){
	             this.height = args.height;
	      }
          if (args.labelsWidth != null){
	             this.labelsWidth = args.labelsWidth;
	      }
          
       }
       
 };
 
 DygraphWidget.prototype.draw = function (data, colors, labels){
	 //<table><tr><td><div id = 'dygraphs' style='width:" + (_this.graphWidth -  this.labelsWidth) + "px;height:" +_this.graphHeight + "px;'></div></td><td><div id='dygraphLabels' style='margin:5;border: 1px solid gray;font-size:8px;width: " + this.labelsWidth+ "px;height:" +_this.graphHeight + "px;'></td></tr></table
	 //document.getElementById('dygraphs').setAttribute("width", )
	 
	 document.getElementById(this.targetId).innerHTML = "";
	 /** Creating legend in a table **/
	 var table = document.createElement("table");
	 var tr = document.createElement("tr");
	 var tdCanvas = document.createElement("td");
	 
	 var canvasDiv = document.createElement("div");
	 canvasDiv.setAttribute("id", "dygraph_canvas_" + this.id);
//	 canvasDiv.setAttribute("style", "width:" + (this.width -  this.labelsWidth) + "px;height:400px");
	 canvasDiv.setAttribute("style", "width:" + (this.width) + "px;height:" + this.height +"px");
	 tdCanvas.appendChild(canvasDiv);
	 
//	 var tdLegend = document.createElement("td");
	 var legendDiv = document.createElement("div");
//	 legendDiv.setAttribute("style", "width:100px;height:400px");
//	 tdLegend.appendChild(legendDiv);
	 
	 
	 tr.appendChild(tdCanvas);
	 table.appendChild(tr);
	 
	 document.getElementById(this.targetId).appendChild(table);

	 var chart1 =  new Dygraph( 		canvasDiv,
									data,
									  {
									        labels							: labels,
									        labelsDiv						: legendDiv,//document.getElementById(this.labelsContainerId),
											labelsSeparateLines				: true,
											highlightCircleSize				: 3,
											strokeWidth						: 1,
											colors							: colors,
											rangeSelectorPlotStrokeColor	: 'rgba(50,50,50,0.3)',
											rangeSelectorPlotFillColor		: 'rgba(50,50,50,0.1)'
									  }); 
};
