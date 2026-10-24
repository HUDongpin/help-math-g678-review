on(release){
   this._visible = false;
   this.swapDepths(_parent.Mc_SwapDepth);
   removeMovieClip(_parent.Mc_SwapDepth);
   _parent.NMHBtn.enabled = true;
   if(_parent.BTNNewEnable == true)
   {
      _parent.ButtonNew.enabled = true;
   }
   else
   {
      _parent.ButtonAns.enabled = true;
      _parent.ButtonUp.enabled = true;
      _parent.ButtonDown.enabled = true;
   }
}
