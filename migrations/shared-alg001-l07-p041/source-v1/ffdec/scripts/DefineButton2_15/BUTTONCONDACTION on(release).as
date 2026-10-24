on(release){
   NMHBtn.enabled = false;
   if(boolDoneClicked)
   {
      BtnDone.enabled = false;
   }
   Mc_Temp._visible = false;
   mc._visible = false;
   h1._visible = false;
   h2._visible = false;
   _root.disableQuizButton();
   Mc_Popup._visible = true;
   Mc_Popup.Mc_Ani.Mc_Ani1.gotoAndPlay(2);
   Mc_Popup.Mc_Ani.Mc_Ani2.gotoAndPlay(2);
   CloseBtn._visible = true;
}
