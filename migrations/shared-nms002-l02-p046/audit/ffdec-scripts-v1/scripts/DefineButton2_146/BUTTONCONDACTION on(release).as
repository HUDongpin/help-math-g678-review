on(release){
   _global.tryCount++;
   tempAns1 = parseFloat(txtQNum.text) / parseFloat(txtANum.text);
   tempAns2 = parseFloat(txtQDen.text) / parseFloat(txtADen.text);
   txtANum.type = "dynamic";
   txtANum.selectable = false;
   txtADen.type = "dynamic";
   txtADen.selectable = false;
   NMHBtn.enabled = false;
   ButtonUp.enabled = false;
   ButtonDown.enabled = false;
   ButtonAns.enabled = false;
   if(tempAns1 == tempAns2)
   {
      Mc_Right_FeedBack.FB_txt.text = "Yes, you are correct.";
      Mc_Right_FeedBack._visible = true;
      Coach_audio_2.gotoAndPlay(2);
   }
   else
   {
      if(_global.tryCount == 1)
      {
         Mc_Wrong_FeedBack_1._visible = true;
      }
      else
      {
         _global.tryCount = 0;
         Mc_Wrong_FeedBack_2._visible = true;
      }
      Coach_audio_1.gotoAndPlay(2);
   }
}
