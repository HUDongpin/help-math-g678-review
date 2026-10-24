on(release){
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "The slope is the coefficient of the x-term.";
   }
   else
   {
      _global.WrongFeed = "The slope is the coefficient of the x-term. Try again.";
   }
   _root.disableQuizButton();
   Mc_Wrong_Feed4.gotoAndPlay(2);
   NMHBtn.enabled = false;
}
