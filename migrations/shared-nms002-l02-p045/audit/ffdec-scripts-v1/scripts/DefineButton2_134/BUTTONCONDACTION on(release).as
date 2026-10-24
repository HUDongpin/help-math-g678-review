on(release){
   _global.tryCount++;
   Numtxt.type = "dynamic";
   Numtxt.selectable = false;
   Dentxt.type = "dynamic";
   Dentxt.selectable = false;
   NMHBtn.enabled = false;
   ButtonAns.enabled = false;
   if(Numtxt.text == _global.numText && Dentxt.text == _global.denText)
   {
      Mc_Right_FeedBack.FB_txt.text = "Yes, you are correct.";
      Mc_Right_FeedBack._visible = true;
      Coach_audio_2.gotoAndPlay(2);
   }
   else
   {
      if(_global.tryCount == 1)
      {
         Mc_Wrong_FeedBack.FB_txt.text = "The numerator represents the parts selected. Try again.";
      }
      else
      {
         Mc_Wrong_FeedBack.FB_txt.text = "The numerator represents the parts selected.";
      }
      Mc_Wrong_FeedBack._visible = true;
      Coach_audio_1.gotoAndPlay(2);
   }
}
