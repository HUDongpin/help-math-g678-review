on(release){
   i = 0;
   while(i < 4)
   {
      eval("Ans_mc" + i).ans1.type = "dynamic";
      eval("Ans_mc" + i).ans1.selectable = false;
      i++;
   }
   Done_btn.enabled = false;
   _global.wrong = false;
   _global.empty = false;
   i = 0;
   while(i < 4)
   {
      if(eval("Ans_mc" + i).ans1.text == "")
      {
         _global.empty = true;
      }
      i++;
   }
   i = 0;
   while(i < 4)
   {
      if(eval("Ans_mc" + i).ans1.text != "" && eval("Ans_mc" + i).ans1.text != _global.myAnswers[i])
      {
         _global.wrong = true;
         eval("Ans_mc" + i).ans1.text = "";
      }
      i++;
   }
   if(_global.wrong)
   {
      _global.quizTryCount++;
      if(_global.quizTryCount == 1)
      {
         Popfeed_mc.txtFeed.text = "Multiply each input by itself. A negative number times a negative number is a positive number. Try again.";
      }
      else
      {
         Popfeed_mc.txtFeed.text = "Multiply each input by itself. A negative number times a negative number is a positive number.";
      }
      Popfeed_mc._visible = true;
   }
   else if(_global.empty)
   {
      Popfeed_mc.txtFeed.text = "Please fill in all empty boxes and click Done";
      Popfeed_mc._visible = true;
   }
   else
   {
      Audio_FB.gotoAndPlay(2);
   }
}
