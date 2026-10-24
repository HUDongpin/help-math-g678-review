on(release){
   this._visible = false;
   _parent.Wrong_Btn.enabled = true;
   _parent.DL_Btn.enabled = true;
   _parent.NMHBtn.enabled = true;
   _parent.enableMC();
   _parent.hideMovieClip();
   _parent.rmMovieClip();
   if(_global.quizTryCount >= 2)
   {
      _global.quizSection = false;
      _parent.play();
   }
}
