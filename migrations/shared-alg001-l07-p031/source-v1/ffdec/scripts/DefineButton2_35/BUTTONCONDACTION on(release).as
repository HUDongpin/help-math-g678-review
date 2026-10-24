on(release){
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "The function should use 50 cents as a dollar amount.";
   }
   else
   {
      _global.WrongFeed = "The function should use 50 cents as a dollar amount. Try again.";
   }
   _root.disableQuizButton();
   _root.showWrongFeed();
}
