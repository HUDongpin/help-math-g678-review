on(release){
   if(_global.quizTryCount == 1)
   {
      _global.WrongFeed = "Form a triangle using two points whose coordinates you know. The slope equals the vertical length divided by horizontal length.";
   }
   else
   {
      _global.WrongFeed = "Form a triangle using two points whose coordinates you know. The slope equals the vertical length divided by horizontal length. Try again.";
   }
   _root.disableQuizButton();
   Mc_Wrong_Feed4.gotoAndPlay(2);
   NMHBtn.enabled = false;
}
