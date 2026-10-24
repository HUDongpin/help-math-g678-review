stop();
_parent.Done.enabled = true;
this.gotoAndStop(1);
_parent.NMHBtn.enabled = true;
if(_global.quizTryCount >= 2)
{
   _global.quizTryCount = 0;
   _global.quizSection = false;
   _parent.Done_btn._visible = false;
   _parent.play();
}
