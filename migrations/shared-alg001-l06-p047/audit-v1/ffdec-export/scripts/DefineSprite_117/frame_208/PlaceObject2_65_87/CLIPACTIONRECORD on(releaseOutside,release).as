on(releaseOutside,release){
   stopDrag();
   if(eval(this._droptarget) == _parent.Drop_mc1 || eval(this._droptarget) == _parent.Drop_mc2)
   {
      if(eval(this._droptarget) == _parent.Drop_mc1)
      {
         _parent.Drop_mc1._visible = false;
         _X = _parent.Drop_mc1._x;
         _Y = _parent.Drop_mc1._y;
         _global.quizDragCount++;
         _parent.Coach_audio_2.gotoAndPlay(2);
         _root.showRightFeed();
         enabled = false;
      }
      else if(eval(this._droptarget) == _parent.Drop_mc2)
      {
         _parent.Drop_mc2._visible = false;
         _X = _parent.Drop_mc2._x;
         _Y = _parent.Drop_mc2._y;
         _global.quizDragCount++;
         _parent.Coach_audio_2.gotoAndPlay(2);
         _root.showRightFeed();
         enabled = false;
      }
      else
      {
         _X = OrgX;
         _Y = OrgY;
         _parent.Coach_audio_1.gotoAndPlay(2);
         _parent.Mc_txt1._visible = true;
      }
   }
   else
   {
      _X = OrgX;
      _Y = OrgY;
      _parent.Coach_audio_1.gotoAndPlay(2);
      _parent.Mc_txt1._visible = true;
   }
}
