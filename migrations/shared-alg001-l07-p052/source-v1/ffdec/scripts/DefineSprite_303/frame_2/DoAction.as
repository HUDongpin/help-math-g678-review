function disableMc()
{
   i = 1;
   while(i <= 6)
   {
      eval("Mc" + i + "_1").enabled = false;
      eval("Mc" + i + "_2").enabled = false;
      i++;
   }
}
function enableMc()
{
   i = 1;
   while(i <= 6)
   {
      eval("Mc" + i + "_1").enabled = true;
      eval("Mc" + i + "_2").enabled = true;
      i++;
   }
}
stop();
_global.quizSection = true;
_global.score = 0;
_global.ansClickCount = 0;
_global.totAnsCount = 0;
_global.chkMcName = "";
_global.gameLevel1 = false;
_global.gameLevel2 = false;
Mc_Score.gotoAndPlay(1);
Mc_Popup._visible = false;
i = 1;
while(i <= 6)
{
   eval("Mc" + i + "_1").gotoAndStop(1);
   eval("Mc" + i + "_2").gotoAndStop(1);
   i++;
}
i = 1;
while(i <= 6)
{
   eval("Mc" + i + "_Img1")._visible = false;
   eval("Mc" + i + "_Img2")._visible = false;
   i++;
}
var intervalID;
