on(release){
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "To square a number, multiply the number by itself. ";
   }
   else
   {
      _global.WrongFeed = "To square a number, multiply the number by itself. Try again.";
   }
   _root.disableQuizButton();
   _root.showWrongFeed();
}
