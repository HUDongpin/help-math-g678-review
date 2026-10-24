on(release){
   _global.quizTryCount++;
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "To cube a number, multiply the number by itself, then multiply the result by the number as well.  Try again.";
   }
   else
   {
      _global.WrongFeed = "To cube a number, multiply the number by itself, then multiply the result by the number as well.";
   }
   _root.disableQuizButton();
   _root.showWrongFeed();
}
