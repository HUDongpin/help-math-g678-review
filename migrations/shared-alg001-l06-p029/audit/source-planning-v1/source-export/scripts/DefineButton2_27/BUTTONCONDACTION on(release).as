on(release){
   Done.enabled = false;
   _global.quizTryCount++;
   enabled = false;
   if(Entry_txt.text == "3")
   {
      _root.showRightFeed();
   }
   else
   {
      if(_global.quizTryCount == 1)
      {
         _global.Wrongfeed = "Each ordered pair contains two numbers. Try again. ";
      }
      else
      {
         _global.Wrongfeed = "Each ordered pair contains two numbers.";
      }
      _root.showWrongFeed();
   }
}
