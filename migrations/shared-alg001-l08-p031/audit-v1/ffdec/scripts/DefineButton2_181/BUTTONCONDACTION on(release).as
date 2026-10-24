on(release){
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "The variables in a linear function cannot be in denominators, and they cannot have exponents.";
   }
   else
   {
      _global.WrongFeed = "The variables in a linear function cannot be in denominators, and they cannot have exponents. Try again.";
   }
   _root.disableQuizButton();
   Mc_Wrong_Feed4.gotoAndPlay(2);
   NMHBtn.enabled = false;
}
