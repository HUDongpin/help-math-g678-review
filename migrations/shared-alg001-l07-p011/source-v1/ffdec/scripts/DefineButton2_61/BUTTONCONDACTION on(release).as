on(release){
   BtnLine.enabled = false;
   Mc_Drag.enabled = false;
   _global.TryCount++;
   if(txtSlope.text == "2")
   {
      _global.quizSection = false;
      play();
   }
   else
   {
      if(_global.TryCount == 1)
      {
         _global.WrongFeed = "Enter the value 2 in the slope in the equation. Try again.";
      }
      else
      {
         _global.WrongFeed = "Enter the value 2 in the slope in the equation.";
      }
      Mc_Feed_Popup1._visible = true;
      Mc_Feed_Popup1.gotoAndPlay(2);
   }
}
