on(release){
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "Select the y-coordinate of the point where the line intersects the y-axis.";
   }
   else
   {
      _global.WrongFeed = "Select the y-coordinate of the point where the line intersects the y-axis. Try again.";
   }
   _root.disableQuizButton();
   _root.showWrongFeed();
}
