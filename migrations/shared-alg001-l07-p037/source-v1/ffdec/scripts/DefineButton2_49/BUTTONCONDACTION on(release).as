on(release){
   this._visible = false;
   i = 0;
   while(i < 4)
   {
      _parent["Ans_mc" + i].ans1.type = "input";
      _parent["Ans_mc" + i].ans1.selectable = true;
      i++;
   }
   _parent.Done_btn.enabled = true;
   if(_global.quizTryCount >= 2)
   {
      _global.quizSection = false;
      _parent.play();
   }
}
