on(releaseOutside,release){
   stopDrag();
   tempSplSrc = this._name.split("_");
   if(eval(this._droptarget) == _parent["Mc_Tar_" + tempSplSrc[tempSplSrc.length - 1]])
   {
      _global.quizDragCount++;
      _parent["Mc_Tar_" + tempSplSrc[tempSplSrc.length - 1]]._alpha = 100;
      _parent.NMHBtn.enabled = false;
      _parent.disableMC();
      _parent.Coach_audio_2.gotoAndPlay(2);
      this._visible = false;
   }
   else
   {
      this._x = oX;
      this._y = oY;
      _parent.disableMC();
      _parent.Coach_audio_1.gotoAndPlay(2);
      _parent.NMHBtn.enabled = false;
   }
}
