function enableMC()
{
   i = 0;
   while(i <= 9)
   {
      eval("Scr_" + i).enabled = true;
      i++;
   }
}
function disableMC()
{
   i = 0;
   while(i <= 9)
   {
      eval("Scr_" + i).enabled = false;
      i++;
   }
}
stop();
_global.quizSection = true;
_global.quizDragCount = 0;
Pop1_mc._visible = false;
Mc_Popup._visible = false;
