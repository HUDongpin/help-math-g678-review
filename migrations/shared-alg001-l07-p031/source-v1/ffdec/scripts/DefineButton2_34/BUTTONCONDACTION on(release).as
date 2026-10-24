on(release){
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "The function should be a formula for the number of dollars earned, not the number of sunglasses sold.";
   }
   else
   {
      _global.WrongFeed = "The function should be a formula for the number of dollars earned, not the number of sunglasses sold. Try again.";
   }
   _root.disableQuizButton();
   _root.showWrongFeed();
}
