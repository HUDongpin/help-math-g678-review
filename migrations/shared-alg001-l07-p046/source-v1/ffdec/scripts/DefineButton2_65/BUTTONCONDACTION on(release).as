on(release){
   if(_global.Y != "" && _global.C != "")
   {
      Mc_Popup3.txtFeed.text = "You have selected two points. Please click the Draw Line Button";
      Mc_Popup3._visible = true;
      Wrong_Btn.enabled = false;
      DL_Btn.enabled = false;
      NMHBtn.enabled = false;
      disableMC();
   }
   else
   {
      _global.mcCount++;
      tempMcName = "Mc_" + _global.mcCount;
      duplicateMovieClip("point_mc",tempMcName,16384 + _global.mcCount);
      eval(tempMcName)._x = _xmouse;
      eval(tempMcName)._y = _ymouse;
      if(_global.Y == "")
      {
         _global.Y = tempMcName;
      }
      else
      {
         _global.C = tempMcName;
      }
   }
}
