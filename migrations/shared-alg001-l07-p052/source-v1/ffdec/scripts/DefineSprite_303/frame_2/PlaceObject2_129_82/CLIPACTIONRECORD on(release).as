on(release){
   function fadeOut1()
   {
      var _loc1_ = _parent;
      if(_loc1_[splTempName[0] + "_2"]._alpha > 0)
      {
         _loc1_[splTempName[0] + "_2"]._alpha -= 40;
      }
      else
      {
         clearInterval(intervalID);
         _loc1_[splTempName[0] + "_2"]._visible = false;
      }
      if(_alpha > 0)
      {
         _alpha = _alpha - 40;
      }
      else
      {
         clearInterval(intervalID);
         _visible = false;
      }
      _loc1_[splTempName[0] + "_Img1"]._visible = true;
      _loc1_[splTempName[0] + "_Img2"]._visible = true;
   }
   function fadeOut2()
   {
      var _loc1_ = _parent;
      if(_loc1_[splTempName[0] + "_1"]._alpha > 0)
      {
         _loc1_[splTempName[0] + "_1"]._alpha -= 40;
      }
      else
      {
         clearInterval(intervalID);
         _loc1_[splTempName[0] + "_1"]._visible = false;
      }
      if(_alpha > 0)
      {
         _alpha = _alpha - 40;
      }
      else
      {
         clearInterval(intervalID);
         _visible = false;
      }
      _loc1_[splTempName[0] + "_Img1"]._visible = true;
      _loc1_[splTempName[0] + "_Img2"]._visible = true;
   }
   function fadeOut3()
   {
      var _loc1_ = _parent;
      var _loc2_ = _global;
      if(_loc1_[splChkMcName[0] + "_2"]._alpha > 0)
      {
         _loc1_[splChkMcName[0] + "_2"]._alpha -= 10;
      }
      else
      {
         clearInterval(intervalID);
         _loc1_[splChkMcName[0] + "_2"]._visible = false;
      }
      if(_loc1_[_loc2_.chkMcName]._alpha > 0)
      {
         _loc1_[_loc2_.chkMcName]._alpha -= 10;
      }
      else
      {
         clearInterval(intervalID);
         _loc1_[_loc2_.chkMcName]._visible = false;
      }
      _loc1_[splChkMcName[0] + "_Img1"]._visible = true;
      _loc1_[splChkMcName[0] + "_Img2"]._visible = true;
   }
   function fadeOut4()
   {
      var _loc1_ = _parent;
      var _loc2_ = _global;
      if(_loc1_[splChkMcName[0] + "_1"]._alpha > 0)
      {
         _loc1_[splChkMcName[0] + "_1"]._alpha -= 10;
      }
      else
      {
         clearInterval(intervalID);
         _loc1_[splChkMcName[0] + "_1"]._visible = false;
      }
      if(_loc1_[_loc2_.chkMcName]._alpha > 0)
      {
         _loc1_[_loc2_.chkMcName]._alpha -= 10;
      }
      else
      {
         clearInterval(intervalID);
         _loc1_[_loc2_.chkMcName]._visible = false;
      }
      _loc1_[splChkMcName[0] + "_Img1"]._visible = true;
      _loc1_[splChkMcName[0] + "_Img2"]._visible = true;
   }
   _global.ansClickCount++;
   tempName = _name;
   var intervalID;
   splTempName = tempName.split("_");
   if(_global.ansClickCount == 1)
   {
      _global.chkMcName = tempName;
      gotoAndStop(2);
   }
   else
   {
      _parent.disableMc();
      _global.ansClickCount = 0;
      if(splTempName[1] == "1")
      {
         if(_parent[splTempName[0] + "_2"]._currentframe == 2)
         {
            gotoAndStop(2);
            _parent[splTempName[0] + "_2"].gotoAndPlay(1);
            gotoAndPlay(1);
            _parent[splTempName[0] + "_2"]._alpha = 100;
            _alpha = 100;
            clearInterval(intervalID);
            intervalID = setInterval(fadeOut1,100);
            _global.score += 10;
            _parent.Mc_Score.gotoAndPlay(1);
            _parent.Mc_Feed2.gotoAndPlay(2);
         }
         else
         {
            splChkMcName = _global.chkMcName.split("_");
            if(splChkMcName[1] == "1")
            {
               _parent[_global.chkMcName].gotoAndStop(1);
            }
            else
            {
               _parent[_global.chkMcName].gotoAndStop(1);
            }
            _global.score -= 2;
            _parent.Mc_Score.gotoAndPlay(1);
            _parent.Mc_Feed1.gotoAndPlay(2);
         }
      }
      if(splTempName[1] == "2")
      {
         if(_parent[splTempName[0] + "_1"]._currentframe == 2)
         {
            gotoAndStop(2);
            _parent[splTempName[0] + "_1"].gotoAndPlay(1);
            gotoAndPlay(1);
            _parent[splTempName[0] + "_1"]._alpha = 100;
            _alpha = 100;
            clearInterval(intervalID);
            intervalID = setInterval(fadeOut2,100);
            _global.score += 10;
            _parent.Mc_Score.gotoAndPlay(1);
            _parent.Mc_Feed2.gotoAndPlay(2);
         }
         else
         {
            splChkMcName = _global.chkMcName.split("_");
            if(splChkMcName[1] == "1")
            {
               _parent[_global.chkMcName].gotoAndStop(1);
            }
            else
            {
               _parent[_global.chkMcName].gotoAndStop(1);
            }
            _global.score -= 2;
            _parent.Mc_Score.gotoAndPlay(1);
            _parent.Mc_Feed1.gotoAndPlay(2);
         }
      }
   }
}
