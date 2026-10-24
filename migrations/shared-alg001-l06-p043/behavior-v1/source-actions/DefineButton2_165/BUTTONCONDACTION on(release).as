on(release){
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "Substitute 23 for C in the equation.";
   }
   else
   {
      _global.WrongFeed = "Substitute 23 for C in the equation. Try again.";
   }
   _root.disableQuizButton();
   Mc_Wrong_Feed4.gotoAndPlay(2);
   NMHBtn.enabled = false;
}
