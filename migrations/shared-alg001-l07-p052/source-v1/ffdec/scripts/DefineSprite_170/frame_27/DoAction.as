stop();
_parent.enableMc();
_global.totAnsCount++;
if(_global.totAnsCount >= 6)
{
   _global.totAnsCount = 0;
   _global.quizSection = false;
   _parent.nextFrame();
}
