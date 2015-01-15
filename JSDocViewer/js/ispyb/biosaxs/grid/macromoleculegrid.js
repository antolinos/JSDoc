/**
 * Macromolecule Grid showing macromolecules and adding anb updating buttons
 * 
 * @height
 * @maxHeight
 * @width
 * @cssFontStyle
 * @searchBar makes this grid as Ext.ux.LiveSearchGridPanel
 * @tbar top bar containing "Add" and "Update From SMIS" button 
 * @collapsed
 * @collapsible
 * @btnEditVisible
 * @btnRemoveVisible
 * @multiselect makes it multiselect using Ext.selection.CheckboxModel
 * 
 * #onSelected
 * #onMacromoleculesChanged
 */
function MacromoleculeGrid(args) {
	this.height = 500;
	this.width = 500;
	this.id = BUI.id();
	this.maxHeight = this.height;

	this.searchBar = false;
	this.tbar = false;

	this.collapsible = true;
	this.collapsed = true;

	this.btnEditVisible = true;
	this.btnRemoveVisible = false;
	this.multiselect = false;

	/** Font style applied to the acronym column **/
	this.cssFontStyle = null;

	if (args != null) {
		if (args.height != null) {
			this.height = args.height;
			this.maxHeight = this.height;
		}
		if (args.maxHeight != null) {
			this.maxHeight = args.maxHeight;
		}
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.cssFontStyle != null) {
			this.cssFontStyle = args.cssFontStyle;
		}

		if (args.searchBar != null) {
			this.searchBar = args.searchBar;
		}
		if (args.tbar != null) {
			this.tbar = args.tbar;
		}
		if (args.collapsible != null) {
			this.collapsible = args.collapsible;
		}
		if (args.collapsed != null) {
			this.collapsed = args.collapsed;
		}
		if (args.btnEditVisible != null) {
			this.btnEditVisible = args.btnEditVisible;
		}
		if (args.btnRemoveVisible != null) {
			this.btnRemoveVisible = args.btnRemoveVisible;
		}
		if (args.multiselect != null) {
			this.multiselect = args.multiselect;
		}
	}

	this.onSelected = new Event();

	this.onMacromoleculesChanged = new Event();
}

MacromoleculeGrid.prototype.edit = function(macromoleculeId) {
	var _this = this;
	var window = new MacromoleculeWindow();
	window.onSuccess.attach(function(sender, proposal) {
		_this.store.loadData(BIOSAXS.proposal.getMacromolecules());
		_this.onMacromoleculesChanged.notify();
	});
	window.draw(BIOSAXS.proposal.getMacromoleculeById(macromoleculeId));
};

MacromoleculeGrid.prototype.getTbar = function() {
	var _this = this;
	var actions = [];

	actions.push(Ext.create('Ext.Action', {
		icon : '../images/add.png',
		text : 'Add macromolecule',
		disabled : false,
		handler : function(widget, event) {
			var window = new MacromoleculeWindow();
			window.onSuccess.attach(function(sender) {
				_this.store.loadData(BIOSAXS.proposal.getMacromolecules());
			});
			window.draw({});
		}
	}));
	actions.push("->");
	actions.push(Ext.create('Ext.Action', {
		icon : '../images/folder_go.png',
		text : 'Update From SMIS',
		tooltip : "Retrieve all the macromolecules of your proposal from SMIS database",
		disabled : false,
		handler : function(widget, event) {
			_this.grid.setLoading("Connecting to SMIS");
			var adapter = new BiosaxsDataAdapter();
			adapter.onSuccess.attach(function(sender, data) {
				BIOSAXS.proposal.setMacromolecules(data.macromolecules);
				_this.refresh(BIOSAXS.proposal.macromolecules);
				_this.grid.setLoading(false);
			});
			adapter.onError.attach(function(sender, data) {
				_this.grid.setLoading(false);
			});
			adapter.updateDataBaseFromSMIS();
		}
	}));
	return actions;
};

MacromoleculeGrid.prototype.deselectAll = function() {
	this.grid.getSelectionModel().deselectAll();
};

MacromoleculeGrid.prototype.selectById = function(macromoleculeId) {
	this.grid.getSelectionModel().deselectAll();
	for ( var i = 0; i < this.grid.getStore().data.items.length; i++) {
		var item = this.grid.getStore().data.items[i].raw;
		if (item.macromoleculeId == macromoleculeId) {
			this.grid.getSelectionModel().select(i);
		}
	}
};

MacromoleculeGrid.prototype.refresh = function(macromolecules) {
	this.store.loadData(macromolecules, false);
};

MacromoleculeGrid.prototype.getColumns = function() {
	var _this = this;
	var columns = [ 
	/*{
		text : '',
		dataIndex : 'macromoleculeId',
		width : 20,
		renderer : function(val, y, sample) {
			return BUI.getRectangleColorDIV(BIOSAXS.proposal.macromoleculeColors[val], 10, 10);
		}
	},*/ 
	{
		text : 'Acronym',
		dataIndex : 'acronym',
		id : this.id + "acronym",
		flex : 1,
		renderer : function(value, metaData, record, rowIndex, colIndex, store) {
			if (_this.cssFontStyle != null) {
				return "<span style='" + _this.cssFontStyle + "'>" + value + "</span>";
			}
			return value;
		}
	}, {
		text : 'Name',
		dataIndex : 'name',
		id : this.id + "name",
		flex : 1,
		hidden : true
	} ];

	if (this.btnEditVisible) {
		columns.push({
			id : _this.id + 'buttonEditMacromolecule',
			width : 85,
			sortable : false,
			renderer : function(value, metaData, record, rowIndex, colIndex, store) {
				if (_this.btnEditVisible) {
					return BUI.getGreenButton('EDIT');
				}
				return null;
			}
		});
	}
	if (this.btnRemoveVisible) {
		columns.push({
			id : _this.id + 'buttonRemoveMacromolecule',
			width : 85,
			sortable : false,
			renderer : function(value, metaData, record, rowIndex, colIndex, store) {
				if (_this.btnRemoveVisible) {
					return BUI.getRedButton('REMOVE');
				}
				return null;
			}
		});
	}

	return columns;
};

MacromoleculeGrid.prototype._prepareData = function(macromolecules) {
	return macromolecules;
};

/** Returns the grid **/
MacromoleculeGrid.prototype.getPanel = function(macromolecules) {
	var _this = this;

	this.store = Ext.create('Ext.data.Store', {
		fields : [ 'macromoleculeId', 'name', 'acronym' ],
		data : _this._prepareData(macromolecules)
	});

	this.store.sort('acronym');

	var type = 'Ext.grid.Panel';
	if (this.searchBar == true) {
		type = 'Ext.ux.LiveSearchGridPanel';
	}

	var selModel = null;
	if (this.multiselect) {
		selModel = Ext.create('Ext.selection.CheckboxModel', {
			multiSelect : this.multiselect,
			listeners : {
				selectionchange : function(sm, selections) {
					var macromolecules = [];
					for ( var i = 0; i < selections.length; i++) {
						macromolecules.push(selections[i].raw);
					}
					_this.onSelected.notify(macromolecules);
				}
			}
		});
	}

	this.grid = Ext.create(type, {
		id : this.id,
		title : 'Macromolecules',
		collapsible : this.collapsible,
		collapsed : this.collapsed,
		store : this.store,
		height : this.height,
		maxHeight : this.maxHeight,
		selModel : selModel,
		allowDeselect : true,
		columns : this.getColumns(),
		width : this.width,
		viewConfig : {
			stripeRows : true,
			listeners : {
				'celldblclick' : function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
					_this.edit(record.data.macromoleculeId);
				},
				'cellclick' : function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
					if (grid.getGridColumns()[cellIndex].getId() == _this.id + 'buttonEditMacromolecule') {
						_this.edit(record.data.macromoleculeId);
					}
					if (grid.getGridColumns()[cellIndex].getId() == _this.id + 'buttonRemoveMacromolecule') {
						BUI.showBetaWarning();
					}
				}

			}
		}
	});

	/** Adding the tbar **/
	if (this.tbar) {
		this.grid.addDocked({
			xtype : 'toolbar',
			items : this.getTbar()
		});
	}
	return this.grid;
};

MacromoleculeGrid.prototype.input = function() {
	return {
		proposal : DATADOC.getProposal_10()
	};
};

MacromoleculeGrid.prototype.test = function(targetId) {
	var macromoleculeGrid = new MacromoleculeGrid({
		width : 800,
		height : 350,
		collapsed : false,
		tbar : true
	});

	BIOSAXS.proposal = new Proposal(macromoleculeGrid.input().proposal);
	var panel = macromoleculeGrid.getPanel(BIOSAXS.proposal.macromolecules);
	panel.render(targetId);
};
