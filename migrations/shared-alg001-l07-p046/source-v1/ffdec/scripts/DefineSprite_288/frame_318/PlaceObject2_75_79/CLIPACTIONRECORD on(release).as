on(release){
   if(_global.Y != "" && _global.C != "")
   {
      _parent.Mc_Popup3.txtFeed.text = "You have choosen two points. Please click on Draw Line Button";
      _parent.Mc_Popup3._visible = true;
      _parent.Wrong_Btn.enabled = false;
      _parent.DL_Btn.enabled = false;
      _parent.NMHBtn.enabled = false;
      _parent.disableMC();
   }
   else
   {
      _global.C = this._name;
      this.enabled = false;
      this.gotoAndStop(2);
   }
}
