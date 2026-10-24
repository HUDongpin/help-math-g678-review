on(release){
   boolDoneClicked = true;
   BtnDone.enabled = false;
   NMHBtn.enabled = false;
   _global.quizTryCount++;
   if(_global.startDragMc == true && (h1._x == Mc_1._x && h2._x == Mc_2._x) || h1._x == Mc_3._x && h2._x == Mc_4._x)
   {
      _root.disableQuizButton();
      _root.showRightFeed();
      h1.Btn.enabled = false;
      h2.Btn.enabled = false;
   }
   else if(_global.startDragMc == true && (h1._x == Mc_2._x && h2._x == Mc_1._x) || h1._x == Mc_4._x && h2._x == Mc_3._x)
   {
      _root.disableQuizButton();
      _root.showRightFeed();
      h1.Btn.enabled = false;
      h2.Btn.enabled = false;
   }
   else
   {
      _global.WrongFeed = "Use the table to make ordered pairs. Then slide the points to the ordered pairs. Try again.";
      _root.disableQuizButton();
      _root.showWrongFeed();
      h1.Btn.enabled = false;
      h2.Btn.enabled = false;
   }
}
