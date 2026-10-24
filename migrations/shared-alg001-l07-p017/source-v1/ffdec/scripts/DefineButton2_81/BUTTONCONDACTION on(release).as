on(release){
   BtnLine.enabled = false;
   Mc_Drag.enabled = false;
   _global.TryCount++;
   if(txtSlope.text == "3")
   {
      _global.quizSection = false;
      play();
   }
   else
   {
      if(_global.TryCount == 1)
      {
         _global.WrongFeed = "Enter the value 3 in the slope box in the equation.  Try again.";
      }
      else
      {
         _global.WrongFeed = "Enter the value 3 in the slope box in the equation.";
      }
      Mc_Feed_Popup1.txtFeed.text = _global.WrongFeed;
      Mc_Feed_Popup1._visible = true;
      Mc_Feed_Popup1.gotoAndPlay(2);
   }
}
