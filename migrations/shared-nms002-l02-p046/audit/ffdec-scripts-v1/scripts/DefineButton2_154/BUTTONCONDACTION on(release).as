on(release){
   Mc_SQ_Main_BG._visible = true;
   _global.depthCount = 1000;
   tempInt = 1001;
   i = tempInt;
   while(i <= _global.tempCount)
   {
      tempMcName = "TempMcSplit_" + i;
      removeMovieClip(tempMcName);
      i++;
   }
   _global.intPicCount++;
   i = 1;
   while(i <= _global.intPicCount)
   {
      tempWidth = Mc_SQ_Main._width / _global.intPicCount;
      _global.depthCount++;
      if(i == 1)
      {
         tempMcName = "TempMcSplit_" + _global.depthCount;
         this.createEmptyMovieClip(tempMcName,_global.depthCount);
         _global.refMc = tempMcName;
         with(eval(tempMcName))
         {
            beginFill(16777215,100);
            lineStyle(1,0,100);
            moveTo(_global.sX,_global.sY);
            lineTo(_global.sX + tempWidth,_global.sY);
            lineTo(_global.sX + tempWidth,156);
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
            lineTo(_global.sX + tempWidth,_global.sY);
            lineTo(_global.sX + tempWidth,156);
            lineTo(_global.sX,156);
            lineTo(_global.sX,_global.sY);
         }
      }
      else
      {
         tempMcName = "TempMcSplit_" + _global.depthCount;
         this.createEmptyMovieClip(tempMcName,_global.depthCount);
         with(eval(tempMcName))
         {
            beginFill(16777215,100);
            lineStyle(1,0,100);
            moveTo(_global.sX + tempWidth * (i - 1),_global.sY);
            lineTo(_global.sX + tempWidth * i,_global.sY);
            lineTo(_global.sX + tempWidth * i,156);
            lineTo(_global.sX + tempWidth * (i - 1),156);
            lineTo(_global.sX + tempWidth * (i - 1),_global.sY);
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
            moveTo(_global.sX + tempWidth * (i - 1),_global.sY);
            lineTo(_global.sX + tempWidth * i,_global.sY);
            lineTo(_global.sX + tempWidth * i,156);
            lineTo(_global.sX + tempWidth * (i - 1),156);
            lineTo(_global.sX + tempWidth * (i - 1),_global.sY);
         }
      }
      i++;
   }
   if(_global.intPicCount > 1)
   {
      txtParts.text = _global.intPicCount + " Pieces";
   }
   else
   {
      txtParts.text = _global.intPicCount + " Piece";
   }
   _global.tempCount = _global.depthCount;
}
