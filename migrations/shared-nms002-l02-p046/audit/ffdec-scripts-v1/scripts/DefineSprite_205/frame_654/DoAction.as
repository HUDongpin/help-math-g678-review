function doGetRndQuest()
{
   var _loc1_ = _global;
   _loc1_.quesCount = _loc1_.quesCount + 1;
   if(_loc1_.questArray.length > 0)
   {
      _loc1_.tryCount = 0;
      ButtonNew.enabled = false;
      ButtonUp.enabled = true;
      ButtonDown.enabled = true;
      ButtonAns.enabled = true;
      txtANum.text = "";
      txtANum.type = "input";
      txtANum.selectable = true;
      txtADen.text = "";
      txtADen.type = "input";
      txtADen.selectable = true;
      _loc1_.intPicCount = 1;
      if(_loc1_.intPicCount > 1)
      {
         txtParts.text = _loc1_.intPicCount + " Pieces";
      }
      else
      {
         txtParts.text = _loc1_.intPicCount + " Piece";
      }
      tempRndNum = random(_loc1_.questArray.length);
      tempVal = _loc1_.questArray[tempRndNum];
      splTempVal = tempVal.split("~");
      _loc1_.numQText = splTempVal[0];
      _loc1_.denQText = splTempVal[1];
      txtQNum.text = _loc1_.numQText;
      txtQDen.text = _loc1_.denQText;
      txtTNum.text = _loc1_.numQText;
      txtTDen.text = _loc1_.denQText;
      _loc1_.questArray.splice(tempRndNum,1);
   }
}
stop();
_global.quizSection = true;
Mc_Wrong_FeedBack_1._visible = false;
Mc_Wrong_FeedBack_2._visible = false;
Mc_Popup._visible = false;
Mc_Right_FeedBack._visible = false;
_global.mcSelCount = 0;
_global.intPicCount = 1;
_global.depthCount = 100;
_global.depthCount++;
_global.questArray = new Array();
_global.questArray = ["2~4","4~12","6~10"];
txtParts.text = "1 Piece";
_global.quesCount = 0;
tempInt = 1001;
i = tempInt;
while(i <= _global.tempCount)
{
   tempMcName = "TempMcSplit_" + i;
   removeMovieClip(tempMcName);
   i++;
}
_global.sX = -310;
_global.sY = -47;
i = 1;
while(i <= _global.intPicCount)
{
   tempMcName = "TempMcSplit_" + _global.depthCount;
   this.createEmptyMovieClip(tempMcName,_global.depthCount);
   with(eval(tempMcName))
   {
      beginFill(16777215,100);
      lineStyle(1,0,100);
      moveTo(_global.sX,_global.sY);
      lineTo(_global.sX + Mc_SQ_Main._width / 1,_global.sY);
      lineTo(_global.sX + Mc_SQ_Main._width / 1,156);
      lineTo(_global.sX,156);
      lineTo(_global.sX,_global.sY);
      endFill();
   }
   eval(tempMcName).onRelease = function()
   {
      theColor = new Color(this);
      tempRGB = theColor.getRGB();
      if(tempRGB.toString() == "16777215" || tempRGB.toString() == "0")
      {
         theColor.setRGB(255);
         _global.mcSelCount++;
      }
      else
      {
         theColor.setRGB(16777215);
         _global.mcSelCount--;
      }
   };
   _global.depthCount++;
   tempMcName = "TempMcSplit_" + _global.depthCount;
   this.createEmptyMovieClip(tempMcName,_global.depthCount);
   with(eval(tempMcName))
   {
      lineStyle(1,0,100);
      moveTo(_global.sX,_global.sY);
      lineTo(_global.sX + Mc_SQ_Main._width / 1,_global.sY);
      lineTo(_global.sX + Mc_SQ_Main._width / 1,156);
      lineTo(_global.sX,156);
      lineTo(_global.sX,_global.sY);
   }
   i++;
}
_global.tempCount = _global.depthCount;
doGetRndQuest();
