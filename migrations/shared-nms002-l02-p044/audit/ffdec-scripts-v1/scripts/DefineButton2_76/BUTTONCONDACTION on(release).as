on(release){
   _global.tryCount++;
   NMHBtn.enabled = false;
   ButtonUp.enabled = false;
   ButtonDown.enabled = false;
   ButtonAns.enabled = false;
   if(_global.numText == _global.mcSelCount.toString() && _global.denText == _global.intPicCount.toString())
   {
      Mc_Right_FeedBack.FB_txt.text = "Yes, you are correct.";
      Mc_Right_FeedBack._visible = true;
      Coach_audio_2.gotoAndPlay(2);
   }
   else if(_global.tryCount == 1)
   {
      Mc_Wrong_FeedBack.FB_txt.text = "Divide the whole into the number of parts which is the same as the denominator, and then click the number of parts that is equivalent to the numerator. Try again.";
      Mc_Wrong_FeedBack._visible = true;
      Coach_audio_1.gotoAndPlay(2);
   }
   else
   {
      _global.tryCount = 0;
      Coach_audio_1.gotoAndPlay(2);
      _global.showAns = true;
      frmLbl = "L" + txtDen.text;
      Mc_Main.gotoAndStop(frmLbl);
      COR_ANS_MC.gotoAndPlay(2);
   }
}
