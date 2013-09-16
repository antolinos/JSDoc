
MeasurementGrid.prototype.refresh = function( ){
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
