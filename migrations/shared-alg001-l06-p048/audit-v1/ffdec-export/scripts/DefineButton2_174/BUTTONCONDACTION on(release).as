on(release){
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "Study the graph carefully.";
   }
   else
   {
      _global.WrongFeed = "Study the graph carefully.Try again.";
   }
   _root.disableQuizButton();
   Mc_Wrong_Feed4.gotoAndPlay(2);
   NMHBtn.enabled = false;
}
