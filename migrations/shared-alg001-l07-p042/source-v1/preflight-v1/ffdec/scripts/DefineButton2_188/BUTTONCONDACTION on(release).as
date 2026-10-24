on(release){
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "The slope of a line is the ratio of the vertical change to the horizontal change.";
   }
   else
   {
      _global.WrongFeed = "The slope of a line is the ratio of the vertical change to the horizontal change. Try again.";
   }
   _root.disableQuizButton();
   Mc_Wrong_Feed4.gotoAndPlay(2);
   NMHBtn.enabled = false;
}
