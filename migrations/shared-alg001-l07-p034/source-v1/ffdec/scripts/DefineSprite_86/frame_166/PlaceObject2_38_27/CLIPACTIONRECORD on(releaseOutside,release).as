on(releaseOutside,release){
   this.stopDrag();
   tempMcName1 = "Tar_1";
   tempMcName2 = "Tar_4";
   if(eval(_droptarget) == eval(_parent[tempMcName1]) || eval(_droptarget) == eval(_parent[tempMcName2]))
   {
      _global.quizDragCount++;
      tempMcName = eval(_droptarget);
      _X = eval(tempMcName)._x;
      _Y = eval(tempMcName)._y;
      _parent.Coach_audio_2.gotoAndPlay(2);
      enabled = false;
      eval(tempMcName)._visible = false;
   }
   else
   {
      _X = oX;
      _Y = oY;
      _parent.Coach_audio_1.gotoAndPlay(2);
      _parent.Popfeed_mc._visible = true;
   }
}
