function doGetRndQuest()
{
   var _loc1_ = _global;
   _loc1_.quesCount = _loc1_.quesCount + 1;
   if(_loc1_.questArray.length > 0)
   {
      _loc1_.showAns = false;
      _loc1_.intPicCount = 1;
      if(_loc1_.intPicCount > 1)
      {
         txtParts.text = _loc1_.intPicCount + " Pieces";
      }
      else
      {
         txtParts.text = _loc1_.intPicCount + " Piece";
      }
      _loc1_.mcSelCount = 0;
      _loc1_.PartsCount = 1;
      _loc1_.tryCount = 0;
      ButtonNew.enabled = false;
      ButtonUp.enabled = true;
      ButtonDown.enabled = true;
      ButtonAns.enabled = true;
      tempRndNum = random(_loc1_.questArray.length);
      tempVal = _loc1_.questArray[tempRndNum];
      splTempVal = tempVal.split("~");
      _loc1_.numText = splTempVal[0];
      _loc1_.denText = splTempVal[1];
      _loc1_.questText = splTempVal[0] + " Out of " + splTempVal[1];
      txtQuest.text = _loc1_.questText;
      txtNum.text = _loc1_.numText;
      txtDen.text = _loc1_.denText;
      Mc_Main.gotoAndStop(1);
      _loc1_.questArray.splice(tempRndNum,1);
   }
}
stop();
_global.quizSection = true;
Mc_Wrong_FeedBack._visible = false;
Mc_Popup._visible = false;
Mc_Right_FeedBack._visible = false;
_global.mcSelCount = 0;
_global.intPicCount = 1;
_global.depthCount = 100;
_global.depthCount++;
_global.questArray = new Array();
_global.questArray = ["1~4","2~10","3~5","6~8"];
txtParts.text = "1 piece";
_global.PartsCount = 1;
_global.quesCount = 0;
doGetRndQuest();
