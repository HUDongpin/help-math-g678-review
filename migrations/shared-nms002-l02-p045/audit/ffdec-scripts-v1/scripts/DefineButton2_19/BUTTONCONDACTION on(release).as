on(release){
   this._visible = false;
   _parent.NMHBtn.enabled = true;
   if(_parent.BTNNewEnable == true)
   {
      _parent.Numtxt.type = "dynamic";
      _parent.Numtxt.selectable = false;
      _parent.Dentxt.type = "dynamic";
      _parent.Dentxt.selectable = false;
      _parent.ButtonNew.enabled = true;
   }
   else
   {
      _parent.Numtxt.type = "input";
      _parent.Numtxt.selectable = true;
      _parent.Dentxt.type = "input";
      _parent.Dentxt.selectable = true;
      _parent.ButtonAns.enabled = true;
   }
}
