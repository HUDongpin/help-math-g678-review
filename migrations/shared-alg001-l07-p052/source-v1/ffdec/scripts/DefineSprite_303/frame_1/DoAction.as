stop();
_global.quizSection = true;
mcL1.gotoAndStop(1);
mcL2.gotoAndStop(1);
mcMute.gotoAndStop(1);
mcStart.gotoAndStop(1);
mcRepeat.gotoAndStop(1);
_global.mute = false;
_global.gameLevel1Finished = false;
_global.gameLevel2Finished = false;
Mc_Popup._visible = false;
if(_global.gameLevel2)
{
   gotoAndStop("Level2");
}
else
{
   gotoAndStop("Level1");
}
