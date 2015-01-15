
function PrimaryDataProcessingGrid(args) {
	QueueGrid.prototype.constructor.call(this, args);
	this.onSelected = new Event(this);
}

PrimaryDataProcessingGrid.prototype.update = QueueGrid.prototype.update;
PrimaryDataProcessingGrid.prototype.refresh = QueueGrid.prototype.refresh;
PrimaryDataProcessingGrid.prototype._prepareData = QueueGrid.prototype._prepareData;
PrimaryDataProcessingGrid.prototype._getTbar = QueueGrid.prototype._getTbar;
PrimaryDataProcessingGrid.prototype._getHTMLRow = QueueGrid.prototype._getHTMLRow;
PrimaryDataProcessingGrid.prototype.openCurveVisualizer = QueueGrid.prototype.openCurveVisualizer;
PrimaryDataProcessingGrid.prototype.getStore = QueueGrid.prototype.getStore;

PrimaryDataProcessingGrid.prototype.getColumns = function() {
	var _this = this;
	return [
			{
				header : "Exp. Id",
				name : "experimentId",
				dataIndex : "experimentId",
				hidden : true
			},
			{
				header : "measurementId",
				name : "experimentId",
				dataIndex : "measurementId",
				hidden : true,
				renderer : function(val, y, sample) {
					return sample.raw.measurementId;
				}
			},
			{
				header : "Run",
				width : 75,
				name : "runNumber",
				dataIndex : "measurementCode",
				hidden : true,
				renderer : function(val, y, sample) {
					var html = "<span style='font-style:bold;font-weight:bold;'>" + val + "</span>";
					if (sample.raw.runCreationDate != null) {
						html = html + "<br/><span style='font-style: italic;color:gray;'>" + moment(sample.raw.runCreationDate).format("HH:mm:ss") + "</span>";
					} else {
						if (sample.raw.creationTime != null) {
							html = html + "<br/><span style='font-style: italic;color:gray;'>" + moment(sample.raw.creationTime).format("HH:mm:ss") + "</span>";
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
				 flex : 1,
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
				width : 60,
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
				// width : 100,
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
				// width : 100,
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
							width : 70,
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
							width : 70,
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
											return BUI.formatValuesErrorUnitsScientificFormat(val, sample.raw.I0Stdev, "", {decimals : 2});
										}
									}
								}
							}
						},
						{
							text : 'Quality',
							dataIndex : 'quality',
							tooltip : 'Estimated data quality. 1.0 - means ideal quality, 0.0 - unusable data. In table format it is given in percent (100% - ideal quality, 0% - unusable data). Please note that this estimation is based only on the Guinier interval (very low angles).',
							width : 60,
							sortable : true,
							renderer : function(val, y, sample) {
								val = sample.raw.quality;
								if (sample.raw.macromoleculeId != null) {
									if (sample.raw.subtractionId != null) {
										if (val != null) {
											if ((val != null) && (val != "")) {
												return Number(val).toFixed(2);
											}
										}
									}
								}
							}
						}, {
							text : 'Aggregated',
							tooltip : "If aggregation was detected from the slope of the data curve at low angles the value is '1', otherwise '0'.",
							dataIndex : 'isagregated',
							width : 80,
							hidden : true,
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
					width : 80,
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
					width : 70,
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
					width : 70,
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
					// flex : 1,
					dataIndex : 'subtractionId',
					type : 'string',
					hidden : true,
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



PrimaryDataProcessingGrid.prototype._getPorod = function() {
	return {
		text : 'Porod',
		name : 'Porod',
		columns : [
				{
					text : 'Volume',
					dataIndex : 'volumePorod',
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
					// width : 95,
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


PrimaryDataProcessingGrid.prototype.getPanel = function(data) {
	var _this = this;
	this.data = _this._prepareData(data);
	/**
	 * Store in Memory
	 */
	this.store = this.getStore();

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


	var view = Ext.create('Ext.toolbar.Toolbar', {
		flex : 1,
		border : 0,
		items : [ button]
	});


	this.grid = Ext.create('Ext.grid.Panel', {
		collapsible : false,
		resizable : true,
		selModel : selModel,
		tbar : [ view ],
		autoscroll : true,
		store : this.store,
//		height : this.height,
//		width : this.width,
		columns : this.getColumns(),
		viewConfig : {
			enableTextSelection : true,
			preserveScrollOnRefresh : true,
			stripeRows : true,
			listeners : {
				'celldblclick' : function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
//					alert("adsa")
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
					
					var selected = [];
					for (var i = 0; i < grid.getSelectionModel().selected.items.length; i++) {
						selected.push(grid.getSelectionModel().selected.items[i].raw);
					}
					_this.onSelected.notify(selected);

				}

			}
		}
	});
	this.grid.on("afterrender", function() {
		
	});
//	this.store.load();
	return this.grid;
};
