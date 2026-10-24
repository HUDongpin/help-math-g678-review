on(release){
   if(_global.gameLevel1 == true || _global.gameLevel2 == true)
   {
      this.gotoAndStop(3);
      _global.startGame = true;
      _root.doNeedMoreHelp("L3GS03",1,6);
   }
   else
   {
      _parent.txtRes_Msg.text = "Please select the Level then Click Start";
   }
}
