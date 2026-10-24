on(release){
   this._visible = false;
   if(_global.questArray.length <= 0)
   {
      _global.quizSection = false;
      _parent.play();
   }
   else
   {
      Numtxt.type = "dynamic";
      Numtxt.selectable = false;
      Dentxt.type = "dynamic";
      Dentxt.selectable = false;
      _parent.ButtonUp.enabled = false;
      _parent.ButtonDown.enabled = false;
      _parent.ButtonAns.enabled = false;
      _parent.NMHBtn.enabled = true;
      _parent.ButtonNew.enabled = true;
   }
}
