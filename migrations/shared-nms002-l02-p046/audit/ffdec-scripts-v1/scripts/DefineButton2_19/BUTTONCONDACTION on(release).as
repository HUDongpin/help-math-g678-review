on(release){
   this._visible = false;
   this.swapDepths(_parent.Mc_SwapDepth);
   removeMovieClip(_parent.Mc_SwapDepth);
   _parent.NMHBtn.enabled = true;
   if(_parent.BTNNewEnable == true)
   {
      _parent.txtANum.type = "dynamic";
      _parent.txtANum.selectable = false;
      _parent.txtADen.type = "dynamic";
      _parent.txtADen.selectable = false;
      _parent.ButtonNew.enabled = true;
   }
   else
   {
      _parent.txtANum.type = "input";
      _parent.txtANum.selectable = true;
      _parent.txtADen.type = "input";
      _parent.txtADen.selectable = true;
      _parent.ButtonAns.enabled = true;
      _parent.ButtonUp.enabled = true;
      _parent.ButtonDown.enabled = true;
   }
}
