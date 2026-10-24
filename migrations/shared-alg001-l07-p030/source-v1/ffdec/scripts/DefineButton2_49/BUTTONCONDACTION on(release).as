on(release){
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "Slope is the vertical change divided by the horizontal change. ";
   }
   else
   {
      _global.WrongFeed = "Slope is the vertical change divided by the horizontal change. Try again.";
   }
   _root.disableQuizButton();
   _root.showWrongFeed();
}
