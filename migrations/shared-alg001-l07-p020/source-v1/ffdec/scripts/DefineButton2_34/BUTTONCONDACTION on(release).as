on(release){
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "This is not the graph of a function, because the graph does not pass the vertical-line test. ";
   }
   else
   {
      _global.WrongFeed = "This is not the graph of a function, because the graph does not pass the vertical-line test. Try again.";
   }
   _root.disableQuizButton();
   _root.showWrongFeed();
}
