on(release){
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "A function must pass the vertical-line test.";
   }
   else
   {
      _global.WrongFeed = "A function must pass the vertical-line test. Try again.";
   }
   _root.disableQuizButton();
   Mc_Wrong_Feed4.gotoAndPlay(2);
   NMHBtn.enabled = false;
}
