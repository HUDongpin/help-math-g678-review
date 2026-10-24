on(release){
   _global.quizTryCount++;
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "Make ordered pairs from the table. Then choose the graph that contains all those pairs. Try again.";
   }
   else
   {
      _global.WrongFeed = "Make ordered pairs from the table. Then choose the graph that contains all those pairs.";
   }
   _root.disableQuizButton();
   _root.showWrongFeed();
}
