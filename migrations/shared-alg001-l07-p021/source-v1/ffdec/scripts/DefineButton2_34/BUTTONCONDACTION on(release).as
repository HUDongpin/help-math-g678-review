on(release){
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "Choose the graph that is a straight line. ";
   }
   else
   {
      _global.WrongFeed = "Choose the graph that is a straight line. Try again.";
   }
   _root.disableQuizButton();
   _root.showWrongFeed();
}
