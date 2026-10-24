on(release){
   this._visible = false;
   _parent.NMHBtn.enabled = true;
   if(_parent.boolDoneClicked)
   {
      _parent.BtnDone.enabled = true;
   }
   _parent.Mc_Temp._visible = true;
   _parent.mc._visible = true;
   _parent.h1._visible = true;
   _parent.h2._visible = true;
   _root.enableQuizButton();
}
