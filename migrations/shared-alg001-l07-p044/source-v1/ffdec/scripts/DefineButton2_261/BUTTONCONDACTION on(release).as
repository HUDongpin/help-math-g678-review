on(release){
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "Find the y-coordinate where the graph intersects the y-axis.";
   }
   else
   {
      _global.WrongFeed = "Find the y-coordinate where the graph intersects the y-axis. Try again.";
   }
   _root.disableQuizButton();
   Mc_Wrong_Feed4.gotoAndPlay(2);
   NMHBtn.enabled = false;
}
