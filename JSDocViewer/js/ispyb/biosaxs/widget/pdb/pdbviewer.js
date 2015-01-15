function PDBViewer(args) {
	this.id = BUI.id();
	this.glMol = null;

	this.width = 600;
	this.height = 600;
	this.title = "";

	if (args != null) {
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height;
		}
		if (args.title != null) {
			this.title = args.title;
		}
	}
}

PDBViewer.prototype.getTitle = function() {
	return "<div style='width:" + this.width + "px; height:20px; font-weight:bold;background-color: #E6E6E6;color:black'>" + this.title + "</div>";
};

PDBViewer.prototype.getTextAreaId = function() {
	return this.id + "_src";
};

PDBViewer.prototype.getCanvas = function() {
	/** For text Area **/
	var textAreaStyle = "width:" + this.width + "px; height: " + this.height + "px;display: none;";
	var textArea = "<textarea id='" + this.getTextAreaId() + "'; style='" + textAreaStyle + "' ></textarea>";
	var style = "width: " + this.width + "px; height: " + this.height + "px; background-color: black;";
	return textArea + "<div id='" + this.id + "'; style='" + style + "' ></div>";

};

PDBViewer.prototype.getDownload = function(type, abInitioModelId) {
	/** For title **/
	var url = BUI.getPdbURL() + '&type=' + type + '&abInitioModelId=' + abInitioModelId;
	html = '<a href=' + url + ' style="color:blue;font-weight:bold;"  height="80" width="80" >Download</a><br /><br />';
	return "<div style='width:" + this.width + "px; height:20px; font-weight:bold;background-color: #336699;color:white'>" + html + "</div>";
};

PDBViewer.prototype.getBar = function() {
	/** For title **/
	return "<div style='width:" + this.width + "px; height:20px; font-weight:bold;background-color: #336699;color:white'></div>";
};

PDBViewer.prototype.refresh = function(models) {
	var _this = this;
	if (BUI.isWebGLEnabled()) {
		this.models = models;
		var adapter = new BiosaxsDataAdapter();
		_this.panel.setLoading("Rendering");
		adapter.onSuccess.attach(function(sender, data) {
			document.getElementById(_this.getTextAreaId()).innerHTML = data.XYZ;
			if (_this.glMol == null) {
				_this.glMol = new GLmol(_this.id);
			} else {
				_this.glMol.loadMolecule();
			}
			_this.panel.setLoading(false);
		});
		adapter.onError.attach(function(sender, data) {
			_this.panel.setLoading("Not available");
		});
		adapter.getPDBContentByModelList(models);
	} else {
		document.getElementById(_this.id).innerHTML = BUI.getWarningHTML("Your browser doesn't support WebGL");
		document.getElementById(_this.id).innerHTML = document.getElementById(_this.id).innerHTML + "<br />";
		document.getElementById(_this.id).innerHTML = document.getElementById(_this.id).innerHTML + BUI.getTipHTML("<a href='http://www.browserleaks.com/webgl#howto-enable-disable-webgl'>How to enable WebGL</a>");
		document.getElementById(_this.id).innerHTML = document.getElementById(_this.id).innerHTML + "<br />";
		document.getElementById(_this.id).innerHTML = document.getElementById(_this.id).innerHTML + BUI.getTipHTML("<a href='http://caniuse.com/webgl'>Can I use WebGL?</a>");
	}
};

PDBViewer.prototype.getOpacity = function(text) {
	if (text == 'Invisible') {
		return '0';
	}
	if (text == 'Minimum') {
		return '0.2';
	}
	if (text == 'Medium') {
		return '0.5';
	}
	if (text == 'High') {
		return '0.7';
	}
	return '1';
};

PDBViewer.prototype.getMenu = function(model) {
	var _this = this;
	function onItemCheck(comp, checked, eOpts) {
		if (checked) {
			var i = null;
			if (comp.group == 'Opacity') {
				for ( i = 0; i < _this.models.length; i++) {
					var opacity = _this.getOpacity(comp.text);
					model.opacity = opacity;
				}
			}

			if (comp.group == 'Radius') {
				for ( i = 0; i < _this.models.length; i++) {
					var radius = _this.getOpacity(comp.text);
					model.radius = radius;
				}
			}

			_this.refresh(_this.models);
		}
	}

	return Ext.create('Ext.menu.Menu', {
		items : [ {
			text : 'Opacity',
			menu : {
				items : [ {
					text : 'Invisible',
					checked : false,
					group : 'Opacity',
					checkHandler : onItemCheck
				}, {
					text : 'Minimum',
					checked : false,
					group : 'Opacity',
					checkHandler : onItemCheck
				}, {
					text : 'Medium',
					checked : false,
					group : 'Opacity',
					checkHandler : onItemCheck
				}, {
					text : 'High',
					checked : false,
					group : 'Opacity',
					checkHandler : onItemCheck
				}, {
					text : 'Opaque',
					checked : false,
					group : 'Opacity',
					checkHandler : onItemCheck
				} ]
			}
		}

		]
	});
};

PDBViewer.prototype.getTbar = function() {
	var _this = this;

	var tb = Ext.create('Ext.toolbar.Toolbar');

	var colorItems = [];
	for ( var i = 0; i < this.models.length; i++) {
		tb.add({
			text : this.models[i].title,
			menu : this.getMenu(this.models[i])
		});
		var color = "#" + this.models[i].color.replace("0x", "");
		colorItems.push({
			html : "<table><tr><td width='15px'>" + BUI.getRectangleColorDIV(color, 10, 10) + "</td><td>" + this.models[i].title + "</td></table>"
		});
	}

	tb.add({
		xtype : 'numberfield',
		labelWidth : 50,
		width : 120,
		fieldLabel : 'Radius',
		value : 3,
		maxValue : 10,
		step : 0.2,
		minValue : 0.1,
		listeners : {
			change : function(cmp) {
				var radius = cmp.getValue();
				for ( var i = 0; i < _this.models.length; i++) {
					_this.models[i].radius = radius;
				}
				_this.refresh(_this.models);
			}
		}
	});
	tb.add("->");
	tb.add(colorItems);
	return tb;
};

PDBViewer.prototype.draw = function(models) {
	this.models = models;
	var _this = this;
	this.panel = Ext.create('Ext.panel.Panel', {
		margin : 2,
		layout : {
			type : 'vbox'
		},
		tbar : this.getTbar(),
		width : this.width - 4,
		height : this.height + 30,
		items : [ {
			html : this.getCanvas()
		}

		],
		listeners : {
			afterRender : function() {
				_this.refresh(models);
			}
		}
	});

	this.panel.setLoading("Rendering");
	return this.panel;
};
