on(release){
   this.createEmptyMovieClip("Mc_SwapDepth",5001);
   Mc_Popup.swapDepths(Mc_SwapDepth);
   Mc_Popup._visible = true;
   txtANum.type = "dynamic";
   txtANum.selectable = false;
   txtADen.type = "dynamic";
   txtADen.selectable = false;
   BTNNewEnable = ButtonNew.enabled;
   NMHBtn.enabled = false;
   ButtonUp.enabled = false;
   ButtonDown.enabled = false;
   ButtonAns.enabled = false;
   ButtonNew.enabled = false;
}
