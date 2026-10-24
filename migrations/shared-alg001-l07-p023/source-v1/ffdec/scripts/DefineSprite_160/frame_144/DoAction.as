function showWrongFeed1()
{
   intMc_Name = random(3);
   intMc_Name += 1;
   eval("_root.animation_mc.animation.Mc_Wrong_Feed" + intMc_Name)._visible = true;
   eval("_root.animation_mc.animation.Mc_Wrong_Feed" + intMc_Name).gotoAndPlay(2);
   eval("_root.animation_mc.animation.Mc_Wrong_Feed" + intMc_Name)._x = 5;
   _global.gSound.setVolume(_global.volLevel);
   _root.doStopSpanishAudio();
}
function showWrongFeed2()
{
   intMc_Name = random(3);
   intMc_Name += 1;
   eval("_root.animation_mc.animation.Mc_Wrong_Feed" + intMc_Name + "_1")._visible = true;
   eval("_root.animation_mc.animation.Mc_Wrong_Feed" + intMc_Name + "_1").gotoAndPlay(2);
   eval("_root.animation_mc.animation.Mc_Wrong_Feed" + intMc_Name + "_1")._x = 5;
   _global.gSound.setVolume(_global.volLevel);
   _root.doStopSpanishAudio();
}
stop();
_global.quizSection = true;
_global.quizTryCount = 0;
