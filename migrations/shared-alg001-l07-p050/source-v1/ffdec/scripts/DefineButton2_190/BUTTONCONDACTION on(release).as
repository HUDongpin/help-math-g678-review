on(release){
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "Multiply the input by itself. Then multiply by 3.14.";
   }
   else
   {
      _global.WrongFeed = "Multiply the input by itself. Then multiply by 3.14. Try again.";
   }
   _root.disableQuizButton();
   Mc_Wrong_Feed4.gotoAndPlay(2);
   NMHBtn.enabled = false;
}
