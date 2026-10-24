on(release){
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "The rate of  7.75 should be the coefficient of the input variable.";
   }
   else
   {
      _global.WrongFeed = "The rate of  7.75 should be the coefficient of the input variable. Try again.";
   }
   _root.disableQuizButton();
   Mc_Wrong_Feed4.gotoAndPlay(2);
   NMHBtn.enabled = false;
}
