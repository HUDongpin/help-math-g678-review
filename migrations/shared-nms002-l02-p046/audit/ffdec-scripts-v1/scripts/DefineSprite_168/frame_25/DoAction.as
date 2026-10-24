this.gotoAndStop(1);
if(_global.questArray.length <= 0)
{
   _global.quizSection = false;
   _parent.play();
}
else
{
   txtANum.type = "dynamic";
   txtANum.selectable = false;
   txtADen.type = "dynamic";
   txtADen.selectable = false;
   _parent.ButtonUp.enabled = false;
   _parent.ButtonDown.enabled = false;
   _parent.ButtonAns.enabled = false;
   _parent.NMHBtn.enabled = true;
   _parent.ButtonNew.enabled = true;
}
