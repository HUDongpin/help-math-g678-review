on(release){
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "Select the coefficient of the x-term. ";
   }
   else
   {
      _global.WrongFeed = "Select the coefficient of the x-term. Try again.";
   }
   _root.disableQuizButton();
   _root.showWrongFeed();
}
