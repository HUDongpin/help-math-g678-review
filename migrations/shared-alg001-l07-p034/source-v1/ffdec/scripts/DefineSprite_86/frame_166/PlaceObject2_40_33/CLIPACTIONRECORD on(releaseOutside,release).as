on(releaseOutside,release){
   this.stopDrag();
   tempMcName = "Tar_" + _name.substring(_name.length - 1,_name.length);
   if(eval(_droptarget) == eval(_parent[tempMcName]))
   {
      _global.quizDragCount++;
      _X = _parent[tempMcName]._x;
      _Y = _parent[tempMcName]._y;
      _parent.Coach_audio_2.gotoAndPlay(2);
      enabled = false;
      _parent[tempMcName].enabled = false;
   }
   else
   {
      _X = oX;
      _Y = oY;
      _parent.Coach_audio_1.gotoAndPlay(2);
      _parent.Popfeed_mc._visible = true;
   }
}
