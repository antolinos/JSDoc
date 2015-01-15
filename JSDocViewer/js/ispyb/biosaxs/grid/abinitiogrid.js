

function AbinitioGrid(args) {
	
	this.onSelected = new Event(this);
};


AbinitioGrid.prototype.refresh = function(data){
	this.store.loadData(this._prepareData(data));
};

AbinitioGrid.prototype._prepareData = function(abinitios){
	/** Parsing data * */
	var models = [];

	for (var k = 0; k < abinitios.length; k++) {
		var data = abinitios[k];
		if (data.averagedModel != null) {
			models.push(data.averagedModel);
			models[models.length - 1].type = "Reference";
		}

		if (data.shapeDeterminationModel != null) {
			models.push(data.shapeDeterminationModel);
			models[models.length - 1].type = "Refined";
		}

		if (data.modelList3VO != null) {
			if (data.modelList3VO.modeltolist3VOs != null) {
				for (var i = 0; i < data.modelList3VO.modeltolist3VOs.length; i++) {
					models.push(data.modelList3VO.modeltolist3VOs[i].model3VO);
					models[models.length - 1].type = "Model";
				}
			}
		}
	}
	return models;
};

AbinitioGrid.prototype.getPanel = function(data){
	var _this = this;
	
	
	var models = this._prepareData(data);
	var modelFields = [ "modelId", "type", "chiSqrt", "dmax", "firFile", "logFile", "fitFile", "pdbFile", "rfactor", "rg", "volume" ];
	Ext.define('AbinitioModel', {
		extend : 'Ext.data.Model',
		fields : modelFields
		
	});

	/**
	 * Store in Memory
	 */
	this.store = Ext.create('Ext.data.Store', {
		model : 'AbinitioModel',
		autoload : true,
		data : models,
		groupField : 'type'
	});
	
	
	  var groupingFeature = Ext.create('Ext.grid.feature.Grouping',{
	        groupHeaderTpl: '{name} ({rows.length} model{[values.rows.length > 1 ? "s" : ""]})',
	        startCollapsed: true,
	        collapsible : true
	  });
	
	this.grid = Ext.create('Ext.grid.Panel', {
		collapsible : false,
		resizable : true,
		features: [groupingFeature],
		autoscroll : true,
		multiSelect : true,
		store : this.store,
		height : 300,
		columns : [ {
			text : "Type",
			dataindex : "type",
			hidden : true,
			renderer : function(a, b, record) {
				return record.data.type;
			},
			flex : 1
		},
		{
			text : "ModelId",
			dataindex : "modelId",
			hidden : true,
			renderer : function(a, b, record) {
					return record.data.modelId;
				
			},
			flex : 1
		},
		
		{
			text : "chiSqrt",
			dataindex : "chiSqrt",
			renderer : function(a, b, record) {
				if (record.data.dmax != null) {
					return BUI.formatValuesUnits(record.data.chiSqrt, "", 12, this.decimals);
				}
				
			},
			flex : 1
		},
		{
			text : "Dmax",
			dataindex : "dmax",
			renderer : function(a, b, record) {
				if (record.data.dmax != null) {
					return BUI.formatValuesUnits(record.data.dmax, "nm", 12, this.decimals);
				}
				
			},
			flex : 1
		}, {
			text : "rFactor",
			dataindex : "rfactor",
			hidden : true,
			renderer : function(a, b, record) {
				if (record.data.rfactor != null) {
					return record.data.rfactor;
				}
			},
			flex : 1
		}, {
			text : "Rg",
			dataindex : "rg",
			renderer : function(a, b, record) {
				if (record.data.rg != null) {
					return BUI.formatValuesUnits(record.data.rg, "nm", 12, this.decimals);
				}
				
			},
			flex : 1
		},
		{
			text : "Volume",
			dataindex : "volume",
			renderer : function(a, b, record) {
				if (record.raw.volume != null){
					return BUI.formatValuesUnits(record.raw.volume, '') + "<span style='font-size:8px;color:gray;'> nm<sub>3</sub></span>";
				}
			},
			flex : 1
		},
		{
			text : "PDB",
			dataindex : "pdbFile",
			renderer : function(a, b, record) {
				if (record.data.pdbFile != null){
					return record.data.pdbFile.split("/")[record.data.pdbFile.split("/").length - 1];
				}
			},
			flex : 1
		}, {
			text : "Fir",
			dataindex : "firFile",
			renderer : function(a, b, record) {
				if (record.data.firFile != null){
					return record.data.firFile.split("/")[record.data.firFile.split("/").length - 1];
				}
			},
			flex : 1
		}, {
			text : "LOG",
			dataindex : "logFile",
			hidden : true,
			renderer : function(a, b, record) {
				if (record.data.logFile != null){
					return record.data.logFile.split("/")[record.data.logFile.split("/").length - 1];
				}
			},
			flex : 1
		}
		],
		viewConfig : {
			enableTextSelection : true,
			preserveScrollOnRefresh : true,
			stripeRows : true,
			listeners : {
				'celldblclick' : function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
				},
				'cellclick' : function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
					var models = [];
					for (var i = 0; i < grid.getSelectionModel().selected.items.length; i++) {
						models.push(grid.getSelectionModel().selected.items[i].raw);
					}
					_this.onSelected.notify(models); 
				}
			}
		}
	});
	return this.grid;
	
};
