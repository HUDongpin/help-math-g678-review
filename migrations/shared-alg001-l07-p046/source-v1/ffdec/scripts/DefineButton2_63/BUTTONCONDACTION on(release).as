on(release){
   if(_global.Y == "" || _global.C == "")
   {
      Mc_Popup3.txtFeed.text = "Please click the y-intercept and click the second point then click the Draw Line button.";
      Mc_Popup3._visible = true;
      Wrong_Btn.enabled = false;
      DL_Btn.enabled = false;
      NMHBtn.enabled = false;
      disableMC();
   }
   else
   {
      createEmptyMovieClip("GLine_Mc",1001);
      tempAns = "PT_2,PT_3,PT_4,PT_5";
      trace(_global.Y == "PT_1" && tempAns.indexOf(_global.C) != -1);
      if(_global.Y == "PT_1" && tempAns.indexOf(_global.C) != -1)
      {
         _global.C = "PT_5";
         _global.Y = "PT_3";
      }
      GLine_Mc.moveTo(eval(_global.C)._x,eval(_global.C)._y);
      GLine_Mc.lineStyle(3,255,100);
      GLine_Mc.lineTo(eval(_global.Y)._x,eval(_global.Y)._y);
      if(tempAns.indexOf(_global.Y) != -1 && tempAns.indexOf(_global.C) != -1)
      {
         hideMovieClip();
         GLine_Mc._visible = true;
         _root.ShowRightFeed();
      }
      else
      {
         _global.quizTryCount++;
         _global.Y = "";
         _global.C = "";
         if(_global.quizTryCount == 1)
         {
            _global.WrongFeed = "Click the y-intercept (0, 2) and then use the slope 1/3 to count up 1 unit and right 3 units to click the second point. Try again.";
         }
         else
         {
            _global.WrongFeed = "Click the y-intercept (0, 2) and then use the slope 1/3 to count up 1 unit and right 3 units to click the second point.";
         }
         _root.ShowWrongFeed();
         Wrong_Btn.enabled = false;
         DL_Btn.enabled = false;
         NMHBtn.enabled = false;
         disableMC();
      }
   }
}
