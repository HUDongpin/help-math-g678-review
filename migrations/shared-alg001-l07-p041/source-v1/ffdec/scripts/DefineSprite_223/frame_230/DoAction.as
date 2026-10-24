function draw()
{
   mc.clear();
   mc.lineStyle(3,16711680);
   mc.moveTo(h1._x,h1._y + 1);
   mc.lineTo(h2._x,h2._y + 1);
}
stop();
Mc_Popup._visible = false;
Mc_txt1._visible = false;
var boolDoneClicked = false;
_global.quizSection = true;
_global.quizDragCount = 0;
_global.quizTryCount = 0;
_global.startDragMc = false;
attachMovie("squareHandle","h1",5);
attachMovie("squareHandle","h2",6);
h1._x = -48;
h1._y = 61;
h2._x = 67;
h2._y = 61;
createEmptyMovieClip("mc",1);
setInterval(draw,25);
BtnDone.enabled = false;
i = 1;
while(i <= 4)
{
   eval("Mc_" + i)._alpha = 0;
   i++;
}
