on(release){
   this._visible = false;
   this.gotoAndStop(2);
   _parent.BtnLine.enabled = true;
   _parent.Mc_Drag.enabled = true;
   if(_global.TryCount >= 2)
   {
      _global.quizSection = false;
      _parent.play();
   }
}
