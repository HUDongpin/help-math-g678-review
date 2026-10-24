on(release){
   if(_global.gameLevel1 == true || _global.gameLevel2 == true)
   {
      this.gotoAndStop(3);
      _global.startGame = true;
      _root.doNeedMoreHelp("L7GS03",1,6);
   }
   else
   {
      _parent.Mc_Msg._visible = true;
   }
}
