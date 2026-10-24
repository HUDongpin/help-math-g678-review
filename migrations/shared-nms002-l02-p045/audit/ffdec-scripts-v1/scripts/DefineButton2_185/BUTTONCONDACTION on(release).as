on(release){
   this._visible = false;
   if(_global.tryCount >= 2)
   {
      _global.tryCount = 0;
      _parent.Numtxt.text = _global.numText;
      _parent.Dentxt.text = _global.denText;
      _parent.COR_ANS_MC.gotoAndPlay(2);
   }
   else
   {
      _parent.Numtxt.type = "input";
      _parent.Numtxt.selectable = true;
      _parent.Dentxt.type = "input";
      _parent.Dentxt.selectable = true;
      _parent.NMHBtn.enabled = true;
      _parent.ButtonUp.enabled = true;
      _parent.ButtonDown.enabled = true;
      _parent.ButtonAns.enabled = true;
   }
}
