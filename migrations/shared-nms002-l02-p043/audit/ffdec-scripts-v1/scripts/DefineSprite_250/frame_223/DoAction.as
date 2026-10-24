function enableButton()
{
   i = 1;
   while(i <= 4)
   {
      eval("Scr_" + i).enabled = true;
      i++;
   }
}
function disableButton()
{
   i = 1;
   while(i <= 4)
   {
      eval("Scr_" + i).enabled = false;
      i++;
   }
}
stop();
_global.quizSection = true;
_global.quizDragCount = 0;
Pop1_mc._visible = false;
