on(release){
   if(_global.mute)
   {
      _global.mute = false;
      _global.VolLevel = 100;
      this.gotoAndStop(1);
   }
   else
   {
      _global.mute = true;
      _global.VolLevel = 0;
      this.gotoAndStop(2);
   }
}
