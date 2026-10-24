function rmMovieClip()
{
   var _loc1_ = _global;
   i = 101;
   while(i <= _loc1_.mcCount)
   {
      tempMcName = "Mc_" + i;
      removeMovieClip(tempMcName);
      i++;
   }
}
function hideMovieClip()
{
}
function disableMC()
{
   i = 101;
   while(i <= _global.mcCount)
   {
      tempMcName = "Mc_" + i;
      eval(tempMcName).enabled = false;
      i++;
   }
   PT_1.enabled = false;
   PT_2.enabled = false;
   PT_3.enabled = false;
   PT_4.enabled = false;
   PT_5.enabled = false;
}
function enableMC()
{
   i = 101;
   while(i <= _global.mcCount)
   {
      tempMcName = "Mc_" + i;
      eval(tempMcName).enabled = true;
      i++;
   }
   PT_1.enabled = true;
   PT_2.enabled = true;
   PT_3.enabled = true;
   PT_4.enabled = true;
   PT_5.enabled = true;
}
stop();
Mc_Popup._visible = false;
Mc_Popup1._visible = false;
Mc_Popup2._visible = false;
Mc_Popup3._visible = false;
Mc_txt1._visible = false;
_global.quizSection = true;
_global.quizDragCount = 0;
_global.quizTryCount = 0;
_global.Firstpoint = false;
_global.Secpoint = 0;
_global.WFeed = false;
_global.mcCount = 100;
_global.Y = "";
_global.C = "";
GLine_Mc._visible = false;
