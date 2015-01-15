/**
 * Ugly workaround because Ext doesn't seem to load PagingMemoryProxy plugin
 * 
 */

/*

 This file is part of Ext JS 4

 Copyright (c) 2011 Sencha Inc

 Contact:  http://www.sencha.com/contact

 GNU General Public License Usage
 This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

 If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

 */
/**
 * @class Ext.ux.data.PagingMemoryProxy
 * @extends Ext.data.proxy.Memory
 *          <p>
 *          Paging Memory Proxy, allows to use paging grid with in memory
 *          dataset
 *          </p>
 */
Ext.define('Ext.ux.data.PagingMemoryProxy', {
	extend : 'Ext.data.proxy.Memory',
	alias : 'proxy.pagingmemory',
	alternateClassName : 'Ext.data.PagingMemoryProxy',

	read : function(operation, callback, scope) {
		
		var reader = this.getReader(), result = reader.read(this.data), sorters, filters, sorterFn, records;

		scope = scope || this;
		// filtering
		filters = operation.filters;
		if (filters.length > 0) {
			// at this point we have an array of Ext.util.Filter
			// objects to filter with,
			// so here we construct a function that combines
			// these filters by ANDing them together
			records = [];

			Ext.each(result.records, function(record) {
				var isMatch = true, length = filters.length, i;

				for (i = 0; i < length; i++) {
					var filter = filters[i], fn = filter.filterFn, scope = filter.scope;

					isMatch = isMatch && fn.call(scope, record);
				}
				if (isMatch) {
					records.push(record);
				}
			}, this);

			result.records = records;
			result.totalRecords = result.total = records.length;
		}

		// sorting
		sorters = operation.sorters;
		if (sorters.length > 0) {
			// construct an amalgamated sorter function which
			// combines all of the Sorters passed
			sorterFn = function(r1, r2) {
				var result = sorters[0].sort(r1, r2), length = sorters.length, i;

				// if we have more than one sorter, OR any
				// additional sorter functions together
				for (i = 1; i < length; i++) {
					result = result || sorters[i].sort.call(this, r1, r2);
				}

				return result;
			};

			result.records.sort(sorterFn);
		}

		// paging (use undefined cause start can also be 0 (thus
		// false))
		
		if (operation.start !== undefined && operation.limit !== undefined) {
			result.records = result.records.slice(operation.start, operation.start + operation.limit);
			result.count = result.records.length;
		}

		Ext.apply(operation, {
			resultSet : result
		});

		operation.setCompleted();
		operation.setSuccessful();

		Ext.Function.defer(function() {
			Ext.callback(callback, scope, [ operation ]);
		}, 10);
	}
});








/**
 * It shows all the measurements done for a proposal
 * 
 */
function QueueGrid(args) {
	this.height = 700;
	this.searchBar = false;
	this.tbar = true;
	this.bbar = false;
	this.collapsed = false;
	this.id = BUI.id();

	this.filter = [];

	
	/** Limit of datacollection to be fecthed **/
	this._limit = 25;
	this.pageSize = 100;
	this.pageCount = null;
	this.currentPage = 1;
	
//	this.title =this.getTitle();
	this.hideSolvents = false;
	
	/** Selected items * */
	this.selected = [];

	/** This is the precission to be shown in the grid * */
	this.decimals = 3;
	if (args != null) {
		if (args.height != null) {
			this.height = args.height;
		}
		if (args.searchBar != null) {
			this.searchBar = args.searchBar;
		}

		if (args.title != null) {
			this.title = args.title;
		}
		
		if (args.tbar != null) {
			this.tbar = args.tbar;
		}

		if (args.collapsed != null) {
			this.collapsed = args.collapsed;
		}

		if (args.width != null) {
			this.width = args.width;
		}
	}
}

QueueGrid.prototype.update = function() {
	var _this = this;
	var adapter = new BiosaxsDataAdapter();
	adapter.onSuccess.attach(function(sender, data) {
		_this.grid.setLoading(false);
		_this.refresh(data);
	});
	_this.grid.setLoading("Updating");
	adapter.getCompactAnalysisByProposalId(this._limit);
};

QueueGrid.prototype.getTitle = function() {
	return 'Last ' + this._limit + ' Data Collections'
};

QueueGrid.prototype.setLimit = function(limit) {
	this._limit = limit;
	this.grid.setTitle( this.getTitle());
};

QueueGrid.prototype.refresh = function(data) {
	console.log("1")
	this.grid.setLoading();
	this.data = data;
	this.store.loadData(this._prepareData(data), false);
	/** Refresh navigation toolbar **/
	this.refreshNavigationBar();
	console.log("2")
	this.grid.setLoading(false);
};

QueueGrid.prototype.refreshNavigationBar = function() {
	if (this.bbar == true){
		Ext.getCmp(this.id + "currentPage").setValue(this.currentPage);
	}
};

QueueGrid.prototype._prepareData = function(records) {
	var data = [];

	/** Filter by STATIC experiments * */
	var aux = [];
	for (var i = 0; i < records.length; i++) {
		if ((records[i].experimentType == "STATIC")||((records[i].experimentType == "CALIBRATION"))) {
			aux.push(records[i]);
		}
	}
	records = aux;

	/** Getting on records[i].averages all the averages done for this measurement * */
	var measurementMergeKeys = {};
	for (var i = 0; i < records.length; i++) {
		/**
		 * If there is not specimen is because there are not, it means that it
		 * is an empty experient *
		 */
		if (records[i].specimenId != null) {
			/** Is there any average associated to that record? * */
			if (records[i].mergeId != null) {
				if (measurementMergeKeys[records[i].measurementId] == null) {
					measurementMergeKeys[records[i].measurementId] = [];
					data.push(records[i]);
				}
				measurementMergeKeys[records[i].measurementId].push(records[i]);
				records[i].averages = measurementMergeKeys[records[i].measurementId];
			} else {
				records[i].averages = [];
				data.push(records[i]);
			}
		}
	}
	/** Adding date **/
	for (var i = 0; i < data.length; i++) {
		data[i]["date"] = moment(data[i].creationDate).format("YYYYMMDD");
	}
	
	/** Remove solvents **/
	if (this.hideSolvents){
		var aux = [];
		for (var i = 0; i < data.length; i++) {
			if (data[i].macromoleculeId != null){
				aux.push(data[i]);
			}
		}
		data = aux;
	}
	
	/** Get only limit **/
	this.data = data.slice(0, this._limit);
	
	return this.data;
};

QueueGrid.prototype.getTbar = function() {
	var button = {
			text : 'Primary Data Processing ',
			xtype : 'button',
			icon : '../images/magnif.png',
			handler : function() {
				var mergeIds = [];
				var subtractionIds = [];
				for (var i = 0; i < _this.selected.length; i++) {
					if (_this.selected[i].mergeId != null) {
						mergeIds.push(_this.selected[i].mergeId);
					}
					/** Buffers row contains also their subtractionId * */
					if (_this.selected[i].macromoleculeId != null) {
						if (_this.selected[i].subtractionId != null) {
							subtractionIds.push(_this.selected[i].subtractionId);
						}
					}
				}
				_this.openCurveVisualizer(mergeIds, subtractionIds);

			}
		};

		
		var _this = this;
		function onItemCheck(option,b){
			/** Only it does something when limit changes **/
			if (option.text != _this._limit){
				if (option.text == "All"){
					_this.setLimit(2000);
				}
				else{
					_this.setLimit(option.text);
					_this.update();
				}
			}
		}
		
		function onHideSolventCheck(option,b){
			_this.hideSolvents = option.checked;
			
			_this.refresh(_this.data);
		}
		
		return Ext.create('Ext.toolbar.Toolbar', {
			flex : 1,
			border : 1,
			items : [{
			                xtype:'button',
			                text: 'Search',
			                icon : '../images/magnif.png',
			                menu: [
			                       {text: 'By date'},
			                       {text: 'By macromolecule'}
			                ]
			         },
			         
			         {
			                xtype:'button',
			                text: 'View',
			                menu: [
			                       { 
			                    	   text: 'Hide solvents',
			                           checked: false,
			                           checkHandler : onHideSolventCheck
			                       },
			                       {
			       	                text: 'Fetch',
			       	                menu: {        // <-- submenu by nested config object
			       	                    items: [
			       	                        // stick any markup in a menu
			       	                        '<b class="menu-title">Choose a number of data collection to be fetched</b>',
			       	                        {
			       	                            text: '25',
			       	                            checked: true,
			       	                            group: 'theme',
			       	                            checkHandler : onItemCheck
			       	                        },
			       	                        {
			       	                            text: '100',
			       	                            checked: false,
			       	                            group: 'theme',
			       	                            checkHandler : onItemCheck
			       	                        }, {
			       	                            text: '200',
			       	                            checked: false,
			       	                            group: 'theme',
			       	                            checkHandler : onItemCheck
			       	                        }, {
			       	                            text: '500',
			       	                            checked: false,
			       	                            group: 'theme',
			       	                            checkHandler : onItemCheck
			       	                        }, {
			       	                            text: '1000',
			       	                            checked: false,
			       	                            group: 'theme',
			       	                            checkHandler : onItemCheck
			       	                        }, {
			       	                            text: 'All',
			       	                            checked: false,
			       	                            group: 'theme',
			       	                            checkHandler : onItemCheck
			       	                        }
			       	                    ]
			       	                }
			       	           }
			                       
			                ]
			         }]
		});
};

QueueGrid.prototype._getPorod = function() {
	return {
		text : 'Porod',
		name : 'Porod',
		columns : [
				{
					text : 'Volume',
					dataIndex : 'volumePorod',
					width : 80,
					sortable : true,
					renderer : function(val, y, sample) {
						if (sample.raw.macromoleculeId != null) {
							if (sample.raw.subtractionId != null) {
								if (sample.raw.volumePorod != null)
									return BUI.formatValuesUnits(sample.raw.volumePorod, '') + "<span style='font-size:8px;color:gray;'> nm<sub>3</sub></span>";
							}
						}
					}
				},
				{
					text : 'MM Vol. est.',
					dataIndex : 'volumeEdna',
					tooltip : '[Volume/2 - Volume/1.5] (Guinier)',
					sortable : true,
        			 width : 95,
					renderer : function(val, y, sample) {
						if (sample.raw.macromoleculeId != null) {
							if (sample.raw.subtractionId != null) {
								if (sample.raw.volume != null)
									return Number(sample.raw.volume / 2).toFixed(1) + " - " + Number(sample.raw.volume / 1.5).toFixed(1)
											+ "<span style='font-size:8px;color:gray;'>kD</span>";
							}
						}
					}
				} ]
	};
};

QueueGrid.prototype._getHTMLRow = function(key, value, error, units, decimals) {
	if (value != null) {
		if (decimals != null) {
			value = Number(value).toFixed(decimals);
		}

		if (error != null) {
			return "<td style='padding:2px;color:gray'>" + key + ": </td><td style='padding-left:10px;font-size:12px;'>" + value + " " + units
					+ "  <span style='font-size:10px;padding-left:5px;'>&#177; " + error + "</span></td>";

		} else {
			return "<tr><td style='padding:2px;color:gray'>" + key + ": </td><td style='padding-left:10px'>" + value + " " + units + "</td></tr>";
		}
	}
	return "";
};


QueueGrid.prototype.openCurveVisualizerBySelected = function(mergeIds, subtractionIds) {
	var mergeIds = [];
	var subtractionIds = [];
	for (var i = 0; i < this.selected.length; i++) {
		if (this.selected[i].mergeId != null) {
			mergeIds.push(this.selected[i].mergeId);
		}
		/** Buffers row contains also their subtractionId * */
		if (this.selected[i].macromoleculeId != null) {
			if (this.selected[i].subtractionId != null) {
				subtractionIds.push(this.selected[i].subtractionId);
			}
		}
	}
	this.openCurveVisualizer(mergeIds, subtractionIds);
};


QueueGrid.prototype.openCurveVisualizer = function(mergeIds, subtractionIds) {
	/**
	 * When showing subtraction we want to show 1) Sample Average 2) Buffer
	 * Average 3) Frames used for the subtraction
	 */
	var viz = new SubtractionCurveVisualizer();
	Ext.create('Ext.window.Window', {
		title : 'Fit Structure to Data',
		height : 500,
		width : 800,
		layout : 'fit',
		items : [ viz.getPanel() ]
	}).show();
	
	viz.refresh(mergeIds, subtractionIds);
};

QueueGrid.prototype.getStore = function() {
	Ext.define('Queue', {
		extend : 'Ext.data.Model',

		fields : ['name', 'date', 'volumePorod', 'runCreationDate', 'measurementCode', 'macromoleculeAcronym', 'bufferAcronym', 'I0', 'I0Stdev', 'acronym', 'averageFilePath',
				'bufferAverageFilePath', 'bufferId', 'bufferOnedimensionalFiles', 'code', 'comments', 'composition', 'concentration', 'creationDate', 'creationTime',
				'dataAcquisitionFilePath', 'dataCollectionId', 'discardedFrameNameList', 'dmax', 'experimentId', 'experimentType', 'exposureTemperature', 'extintionCoefficient',
				'extraFlowTime', 'firstPointUsed', 'flow', 'frameListId', 'framesCount', 'framesMerge', 'gnomFilePath', 'gnomFilePathOutput', 'guinierFilePath', 'isagregated',
				'kratkyFilePath', 'lastPointUsed', 'macromoleculeId', 'measurementId', 'mergeId', 'molecularMass', 'name', 'pH', 'priorityLevelId', 'proposalId', 'quality', 'rg',
				'rgGnom', 'rgGuinier', 'rgStdev', 'runId', 'safetyLevelId', 'sampleAverageFilePath', 'sampleOneDimensionalFiles', 'samplePlatePositionId', 'scatteringFilePath',
				'sequence', 'sessionId', 'sourceFilePath', 'specimenId', 'status', 'stockSolutionId', 'substractedFilePath', 'subtractionId', 'total', 'transmission', 'viscosity',
				'volume', 'volumeToLoad', 'waitTime', 'reference', 'refined' ]
	});
	
	return Ext.create('Ext.data.Store', {
		model : 'Queue',
		pageSize :this.pageSize,
		autoload : true,
		data : this.data,
		groupField : 'date',
		groupDir : 'DESC',
		sorters: [{
	         property: 'measurementId',
	         direction: 'DESC'
	     }],
		proxy : {
			type : 'pagingmemory'
		}
	});

};

QueueGrid.prototype.getBbar = function() {
	this.bbar =  Ext.create('Ext.PagingToolbar', {
		dock : 'bottom',
		store : this.store,
		pageSize : this.pageSize,
		displayInfo : true,
		displayMsg : 'Displaying dataCollections {0} - {1} of {2}',
		emptyMsg : "No dataCollection to display"
	});
	return this.bbar;
	
	this.bbar =  Ext.create('Ext.toolbar.Toolbar', {
		dock : 'bottom',
	    items: [
	            {
		            // xtype: 'button', // default for Toolbars
//		            text: 'Button',
		            cls : 'x-btn-icon x-tbar-page-first'
		        },
		        {
		            // xtype: 'button', // default for Toolbars
		            cls : 'x-btn-icon x-tbar-page-prev'
		        },
		        {
		            xtype: 'textfield', // default for Toolbars
//		            text: 'Button',
		            id : this.id + "currentPage",
		            width : 40,
		            cls : 'x-btn-icon x-tbar-page-next'
		        },
		        {
		            // xtype: 'button', // default for Toolbars
//		            text: 'Button',
		            cls : 'x-btn-icon x-tbar-page-next'
		        },
		        {
		            // xtype: 'button', // default for Toolbars
	//	            text: 'Button',
		            cls : 'x-btn-icon x-tbar-page-last'
		        }
	    ]
	});
	return this.bbar;
};


QueueGrid.prototype.getPanel = function(data) {
	var _this = this;
	this.data = _this._prepareData(data);
	/**
	 * Store in Memory
	 */
	this.store = this.getStore();

	/** Grouping by date **/
	var groupingFeature = Ext.create('Ext.grid.feature.Grouping', {
		groupHeaderTpl : Ext.create('Ext.XTemplate',
				"<div style='background:#0ca3d2; color:white; float:left; margin:6px 8px 0 0; padding:5px 8px;'>{name:this.formatName}</div>", {
					formatName : function(date) {
						return moment(date, "YYYYMMDD").format("MMM Do YY");
					}
				}),
		hideGroupedHeader : true,
		startCollapsed : false
	});
	
	
	/**
	 * Selection mode is multi in order to compare all the frames from different
	 * data collections (measurements)
	 */
	var selModel = Ext.create('Ext.selection.RowModel', {
		allowDeselect : true,
		mode : 'MULTI',
		listeners : {
			selectionchange : function(sm, selections) {
				_this.selected = new Array();
				for (var i = 0; i < selections.length; i++) {
					_this.selected.push(selections[i].raw);
				}
			}
		}
	});

	this.grid = Ext.create('Ext.grid.Panel', {
		title : this.title,
		collapsible : false,
		features : [ groupingFeature ],
		resizable : true,
		selModel : selModel,
		autoscroll : true,
		store : this.store,
		border : 1,
		height : this.height,
		width : this.width,
		columns : this.getColumns(),
		viewConfig : {
			enableTextSelection : true,
			preserveScrollOnRefresh : true,
			stripeRows : true,
			getRowClass : function(record, rowIdx, params, store) {

				if (!record.raw.runCreationDate){
					return "gray-row";
				}
				if (record.raw.macromoleculeId != null){
					return "purple-row";
				}
			},
			listeners : {
				'celldblclick' : function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
					for (var item in grid.getSelectionModel().selected.items){
						if (grid.getSelectionModel().selected.items[item].data.macromoleculeId != null){
							/** Getting subtraction id **/
							var subtractionId = (grid.getSelectionModel().selected.items[item].raw.subtractionId);
							if (subtractionId != null){
								var url = "/ispyb/user/viewProjectList.do?reqCode=display&menu=datacollection&subtractionId=" + subtractionId;
								/** Open it in a new tab **/
								var win = window.open(url, '_blank');
								win.focus();
							}
							else{
								BUI.showWarning("No subtraction found for this measurement");
							}
						}
						else{
							/** It is a buffer it shows just the primary data processing **/
							_this.openCurveVisualizerBySelected();
						}
					}
				},
				'cellclick' : function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
					if (grid.getGridColumns()[cellIndex].getId() == _this.id + 'buttonEditBuffer') {
						_this._edit(record.data.bufferId);
					}

					if (grid.getGridColumns()[cellIndex].getId() == _this.id + 'buttonRemoveBuffer') {
						BUI.showBetaWarning();
					}

					if (grid.getGridColumns()[cellIndex].getId() == _this.id + 'PorodColumn') {
						var macromoleculeWindow = new MacromoleculeWindow();
						macromoleculeWindow.draw(BIOSAXS.proposal.getMacromoleculeById(record.raw.macromoleculeId));

						macromoleculeWindow.onSuccess.attach(function(sender) {
							_this.update();

						});
					}
				}
			}
		}
	});

	/** Adding the tbar * */
	if (this.tbar) {
		this.grid.addDocked(this.getTbar());
	}
	
	if (this.bbar) {
		this.grid.addDocked(this.getBbar());
	}
	return this.grid;
};

QueueGrid.prototype.getColumns = function() {
	var _this = this;
	return [
			{
				header : "Exp. Id",
				name : "experimentId",
				dataIndex : "experimentId",
				hidden : true
			},
			{
				header : "Exp. Name",
				name : "name",
				dataIndex : "name",
				hidden : true
			},
			{
				header : "Measurmt. Id",
				name : "experimentId",
				dataIndex : "measurementId",
				hidden : true,
				renderer : function(val, y, sample) {
					return sample.raw.measurementId;
				}
			},
			{
				header : "date",
				name : "date",
				dataIndex : "date",
				renderer : function(val, y, sample) {
					return sample.raw.date;
				}
			},
			
			{
				header  	: "Run",
				flex 		: 0.2,
				name 		: "runNumber",
				dataIndex 	: "measurementCode",
				renderer 	: function(val, y, sample) {
					var html = "";
					if (val != null){
						html = html + "<span style='font-style:bold;font-weight:bold;'>" + val + "</span>";
					}
					if (sample.raw.runCreationDate != null) {
						html = html + "<br/><span class='ispyb-text-gray'>" + moment(sample.raw.runCreationDate).format("HH:mm:ss") + "</span>";
					}
					else{
						if (sample.raw.status == "ABORTED"){
							html = html + "<br /><span class='ispyb-text-gray' style='color:red;'>Aborted</span>"
						}
						else{
							html = html + "<br /><span class='ispyb-text-gray'>Scheduled</span>"
						}
					}
					return html;
				}
			},
			{
				header : "priorityLevelId",
				name : "priorityLevelId",
				dataIndex : "priorityLevelId",
				hidden : true
			},
			{
				header : "Sample",
				dataIndex : "macromoleculeId",
				name : "macromoleculeAcronym",
				flex : 0.5,
				renderer : function(val, y, sample) {
					var html = "<table>"
					var macromolecule = BIOSAXS.proposal.getMacromoleculeById(sample.raw.macromoleculeId);
					if (macromolecule != null) {
						html = html + '<tr><td><span style="color:green;font-size:14;">' + macromolecule.acronym + '</span></td></tr>';
						html = html + "<tr><td>" + BUI.formatValuesUnits(sample.raw.concentration, "mg/ml", 10, this.decimals) + '</td></tr>';
					}
					if (sample.raw.bufferId != null) {
						if (BIOSAXS.proposal.getBufferById(sample.raw.bufferId) != null) {
							var bufferAcronym = BIOSAXS.proposal.getBufferById(sample.raw.bufferId).acronym;
							if ((bufferAcronym == "") || (bufferAcronym == null)) {
								bufferAcronym = "No name";
							}
							html = html + '<tr><td><span style="color:blue;font-size:14;">' + bufferAcronym + '</span></td></tr><tr><td>';
						}
					}
					html = html + "<tr><td>" + BUI.formatValuesUnits(sample.raw.exposureTemperature, "C", 10, this.decimals) + '</td></tr>';
					return html + "</table>";
				}
			},
			{
				header : "Average",
				dataIndex : "macromoleculeId",
				name : "macromoleculeAcronym",
				flex : 0.2,
				renderer : function(val, y, sample) {
					var html = "<table>";
					if (sample.raw.runId != null) {
						if (sample.raw.framesMerge != null) {
							var f = 'new SubtractionCurveVisualizer().refresh([' + sample.raw.mergeId + '], [])';
							html = html + "<tr onmouseover='' style='color:blue;cursor: pointer;' onclick='" + f + "'><td >" + sample.raw.framesMerge + " of "
									+ sample.raw.framesCount + "</td></tr>";
						}
					}
					if (sample.raw.averages != null) {
						for (var i = 1; i < sample.raw.averages.length; i++) {
							if (sample.raw.averages[i].framesMerge != null) {
								var f = 'new SubtractionCurveVisualizer().refresh([' + sample.raw.averages[i].mergeId + '], [])';
								html = html + "<tr onmouseover='' style='color:gray;font-style: italic; cursor: pointer;'  onclick='" + f + "'><td >"
										+ sample.raw.averages[i].framesMerge + " of " + sample.raw.averages[i].framesCount + "</td></tr>";
							}
						}
					}
					return html + "</table>";
				}
			},
			{
				text : 'Scattering',
				dataIndex : 'subtractionId',
				width : 66,
				name : 'subtractionId',
				renderer : function(val, y, sample) {
					if (sample.raw.macromoleculeId != null) {
						if (sample.raw.subtractionId != null) {
							var url = BUI.getURL() + '&type=scattering&subtractionId=' + sample.raw.subtractionId;
							var event = "OnClick= window.open('" + url + "')";
							return '<img src=' + url + '   height="60" width="60" ' + event + '>';
						}
					}
				}
			},
			{
				text : 'Kratky.',
				dataIndex : 'subtractionId',
				width : 66,
				hidden : true,
				name : 'subtractionId',
				renderer : function(val, y, sample) {
					if (sample.raw.macromoleculeId != null) {
						if (sample.raw.subtractionId != null) {
							var url = BUI.getURL() + '&type=kratky&subtractionId=' + sample.raw.subtractionId;
							var event = "OnClick= window.open('" + url + "')";
							return '<img src=' + url + '   height="60" width="60" ' + event + '>';
						}
					}
				}
			},
			{
				text : 'P(r).',
				hidden : true,
				width : 66,
				dataIndex : 'subtractionId',
				type : 'string',
				renderer : function(val, y, sample) {
					if (sample.raw.macromoleculeId != null) {
						if (sample.raw.subtractionId != null) {
							var url = BUI.getURL() + '&type=gnom&subtractionId=' + sample.raw.subtractionId;
							var event = "OnClick= window.open('" + url + "')";
							return '<img src=' + url + '   height="60" width="60" ' + event + '>';
						}
					}
				}
			},
			{
				text : 'Guinier.',
				hidden : true,
				width : 66,
				dataIndex : 'subtractionId',
				type : 'string',
				renderer : function(val, y, sample) {
					if (sample.raw.macromoleculeId != null) {
						if (sample.raw.subtractionId != null) {
							var url = BUI.getURL() + '&type=guinier&subtractionId=' + sample.raw.subtractionId;
							var event = "OnClick= window.open('" + url + "')";
							return '<img src=' + url + '   height="60" width="60" ' + event + '>sdfsdfs</img>';
						}
					}
				}
			},
			{
				text : 'Guinier',
				name : 'Guinier',
				columns : [
						{
							text : 'Rg',
							dataIndex : 'rg',
							name : 'rg',
							width : 80,
							tooltip : 'In polymer physics, the radius of gyration is used to describe the dimensions of a polymer chain.',
							sortable : true,
							renderer : function(val, y, sample) {
								val = sample.raw.rg;
								if (val != null) {
									if (sample.raw.macromoleculeId != null) {
										if (sample.raw.subtractionId != null) {
											/**
											 * Show warning if rgGuinier and
											 * rgGnom differ more than 10% *
											 */
											if (Math.abs(val - sample.raw.rgGnom) > (val * 0.1)) {
												return "<span style='color:orange;'>" + BUI.formatValuesUnits(val, "") + "</span>";

											}
											return BUI.formatValuesUnits(val, "nm", 12, this.decimals);
										}
									}
								}
							}
						},
						{
							text : 'Points',
							dataIndex : 'points',
							sortable : true,
							hidden : true,
							width : 80,
							type : 'string',
							renderer : function(val, y, sample) {
								if (sample.raw.macromoleculeId != null) {
									if (sample.raw.subtractionId != null) {
										if ((sample.raw.firstPointUsed == "") || (sample.raw.firstPointUsed == null))
											return;
										return "<span>" + sample.raw.firstPointUsed + " - " + sample.raw.lastPointUsed + "<br/> ("
												+ (sample.raw.lastPointUsed - sample.raw.firstPointUsed) + " )</span>";
									}
								}
							}
						},
						{
							text : 'I(0)',
							dataIndex : 'I0',
							sortable : true,
							tooltip : 'Extrapolated scattering intensity at zero angle I(0) (forward scattering)',
							width : 80,
							type : 'string',
							renderer : function(val, y, sample) {
								val = sample.raw.I0;
								if (sample.raw.macromoleculeId != null) {
									if (sample.raw.subtractionId != null) {
										if (val != null) {
											return BUI.formatValuesErrorUnitsScientificFormat(val, sample.raw.I0Stdev, "");
										}
									}
								}
							}
						},
						{
							text : 'Quality',
							dataIndex : 'quality',
							hidden : true,
							tooltip : 'Estimated data quality. 1.0 - means ideal quality, 0.0 - unusable data. In table format it is given in percent (100% - ideal quality, 0% - unusable data). Please note that this estimation is based only on the Guinier interval (very low angles).',
							width : 80,
							sortable : true,
							renderer : function(val, y, sample) {
								val = sample.raw.quality;
								if (sample.raw.macromoleculeId != null) {
									if (sample.raw.subtractionId != null) {
										if (val != null) {
											if ((val != null) && (val != "")) {
												return "<span>" + (Number(val)).toFixed(2) + "</span><span style='font-size:8px;color:gray;'> %</span>";
											}
										}
									}
								}
							}
						}, {
							text : 'Aggregated',
							tooltip : "If aggregation was detected from the slope of the data curve at low angles the value is '1', otherwise '0'.",
							dataIndex : 'isagregated',
							hidden : true,
							width : 80,
							renderer : function(val, y, sample) {
								if (sample.raw.macromoleculeId != null) {
									if (sample.raw.subtractionId != null) {
										if ((sample.raw.isagregated != null)) {
											if (val == true) {
												return "Yes";
											} else {
												return "No";
											}
										}
									}
								}
							}
						} ]
			}, {
				text : 'Gnom',
				name : 'Gnom',
				columns : [ {
					text : 'Rg',
					dataIndex : 'rgGnom',
					type : 'string',
					// flex : 1,
					sortable : true,
					renderer : function(val, y, sample) {
						if (sample.raw.macromoleculeId != null) {
							if (sample.raw.subtractionId != null) {
								/**
								 * Show warning if rgGuinier and rgGnom differ
								 * more than 10% *
								 */
								if (sample.raw.rgGnom != null) {
									if (Math.abs(sample.raw.rgGuinier - sample.raw.rgGnom) > (sample.raw.rgGuinier * 0.1)) {
										return "<span style='color:orange;'>" + BUI.formatValuesUnits(sample.raw.rgGnom, "") + "</span>";

									}
									return BUI.formatValuesUnits(sample.raw.rgGnom, "nm");
								}
							}
						}
					}
				}, {
					text : 'Total',
					dataIndex : 'total',
					// flex : 1,
					sortable : true,
					renderer : function(val, y, sample) {
						if (sample.raw.macromoleculeId != null) {
							if (sample.raw.subtractionId != null) {
								if (sample.raw.total != null)
									return BUI.formatValuesUnits(sample.raw.total, '');
							}
						}
					}
				}, {
					text : 'D<sup>max</sup>',
					dataIndex : 'dmax',
					sortable : true,
					renderer : function(val, y, sample) {
						if (sample.raw.macromoleculeId != null) {
							if (sample.raw.subtractionId != null) {
								if (sample.raw.dmax != null)
									return BUI.formatValuesUnits(sample.raw.dmax, "") + "<span style='font-size:8px;color:gray;'> nm</span>";
							}
						}
					}
				}, {
					text : 'P(r)',
					sortable : true,
					hidden : true,
					// flex : 1,
					dataIndex : 'subtractionId',
					type : 'string',
					renderer : function(val, y, sample) {
						if (sample.raw.macromoleculeId != null) {
							if (sample.raw.subtractionId != null) {
								var url = BUI.getURL() + '&type=gnom&subtractionId=' + sample.raw.subtractionId;
								var event = "OnClick= window.open('" + url + "')";
								return '<img src=' + url + '   height="60" width="60" ' + event + '>';
							}
						}
					}
				} ]
			}, this._getPorod() ]
};













































