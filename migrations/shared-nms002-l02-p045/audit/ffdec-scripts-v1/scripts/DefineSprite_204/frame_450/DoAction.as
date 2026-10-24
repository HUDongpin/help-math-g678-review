function doGetRndQuest()
{
   var _loc1_ = _global;
   _loc1_.quesCount = _loc1_.quesCount + 1;
   if(_loc1_.questArray.length > 0)
   {
      _loc1_.tryCount = 0;
      Numtxt.type = "input";
      Numtxt.selectable = true;
      Dentxt.type = "input";
      Dentxt.selectable = true;
      Numtxt.text = "";
      Dentxt.text = "";
      ButtonNew.enabled = false;
      ButtonUp.enabled = true;
      ButtonDown.enabled = true;
      ButtonAns.enabled = true;
      tempRndNum = random(_loc1_.questArray.length);
      tempLbl = _loc1_.questArray[tempRndNum];
      tempVal = _loc1_.ansArray[tempRndNum];
      splTempVal = tempVal.split("~");
      _loc1_.numText = splTempVal[0];
      _loc1_.denText = splTempVal[1];
      Mc_Circle_Main.gotoAndStop(tempLbl);
      _loc1_.questArray.splice(tempRndNum,1);
      _loc1_.ansArray.splice(tempRndNum,1);
   }
}
stop();
_global.quizSection = true;
Mc_Wrong_FeedBack._visible = false;
Mc_Popup._visible = false;
Mc_Right_FeedBack._visible = false;
_global.questArray = new Array();
_global.questArray = ["L1","L2","L3"];
_global.ansArray = ["2~10","3~10","4~10"];
_global.quesCount = 0;
_global.AnswerCount = 0;
doGetRndQuest();
