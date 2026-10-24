on(release){
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "The graph of a linear function is a straight line.";
   }
   else
   {
      _global.WrongFeed = "The graph of a linear function is a straight line. Try again.";
   }
   _root.disableQuizButton();
   Mc_Wrong_Feed4.gotoAndPlay(2);
   NMHBtn.enabled = false;
}
