on(release){
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "The rate of  7.75 should be the coefficient of the input variable and the output of the function should be M for money not L for laps.";
   }
   else
   {
      _global.WrongFeed = "The rate of  7.75 should be the coefficient of the input variable and the output of the function should be M for money not L for laps. Try again";
   }
   _root.disableQuizButton();
   Mc_Wrong_Feed4.gotoAndPlay(2);
   NMHBtn.enabled = false;
}
