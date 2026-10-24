on(release){
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "The graph of a nonlinear function cannot be a straight line.";
   }
   else
   {
      _global.WrongFeed = "The graph of a nonlinear function cannot be a straight line. Try again.";
   }
   _root.disableQuizButton();
   _root.showWrongFeed();
}
