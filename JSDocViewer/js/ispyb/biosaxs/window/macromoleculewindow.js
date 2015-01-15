
MacromoleculeWindow.prototype.getButtons = GenericWindow.prototype.getButtons; 
MacromoleculeWindow.prototype._render = GenericWindow.prototype._render; 
MacromoleculeWindow.prototype._postRender = GenericWindow.prototype._postRender; 


function MacromoleculeWindow(args){
		 this.width = 600;
	     this.height = 500;
       if (args != null){
          if (args.actions != null){
             this.actions = args.actions;
          }
       }
       this.form = new MacromoleculeForm({width:this.width  - 100});
       GenericWindow.prototype.constructor.call(this, {form:this.form, width:this.width, height:this.height});
       this.onSuccess = new Event();
 }

MacromoleculeWindow.prototype.save = function (){
		var _this = this;
		
		var adapter = new BiosaxsDataAdapter();
		adapter.onSuccess.attach(function(sender, proposal){
			BIOSAXS.proposal.setItems(proposal);
			_this.onSuccess.notify(proposal);
			_this.panel.close();
		});
		
		if (this.form.getMacromolecule().name == ""){
			BUI.showError("Name field is mandatory");
			return;
		}
		if (this.form.getMacromolecule().acronym == ""){
			BUI.showError("Acroynm field is mandatory");
			return;
		}
		this.panel.setLoading("ISPyB: Saving Macromolecule")
		adapter.saveMacromolecule(this.form.getMacromolecule());
		
};


MacromoleculeWindow.prototype.draw = function (macromolecule, experiment){
	this.title = "Macromolecule ";
	if (macromolecule.name != null){
		this.title = "Macromolecule " + macromolecule.name;
	}
	this.experiment = experiment;
	this._render(macromolecule, experiment);
	
};