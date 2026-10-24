onClipEvent(enterFrame){
   if(Number(_parent.txtSlope_2.text) <= 0 && this._x >= -99)
   {
      this._x = -99;
   }
   if(drag)
   {
      _global.cX_1 = this._x;
      tempVal_1 = Math.round(this._x / 1.72 + 108);
      _parent.txtSlope_1.text = tempVal_1;
      tempAddValue_1 = Number(_parent.txtSlope_1.text) - _global.checkValue_1;
      if(tempVal_1 > _global.checkValue_1)
      {
         tempSetX_1 = _global.setX_1 - tempAddValue_1;
         _parent.txtSlope_2.text = _global.addValue_1 - tempAddValue_1;
         _parent.Mc_Drag_2._x = tempSetX_1;
      }
      else
      {
         tempSetX_1 = _global.setX_1 + tempAddValue_1 * -1;
         _parent.txtSlope_2.text = _global.addValue_1 + tempAddValue_1 * -1;
         _parent.Mc_Drag_2._x = tempSetX_1;
      }
      if(Number(_parent.txtSlope_2.text) <= 0)
      {
         _parent.Mc_Drag_2._x = -185;
      }
      if(Number(_parent.txtSlope_2.text) >= 50)
      {
         _parent.Mc_Drag_2._x = -99;
      }
      if(Number(_parent.txtSlope_2.text) == 25)
      {
         _parent.Mc_Drag_2._x = this._x;
      }
      _parent.txt_P_1.text = _parent.txtSlope_1.text + " %";
      _parent.txt_P_2.text = _parent.txtSlope_2.text + " %";
      _parent.txt_D_1.text = Number(_parent.txtSlope_1.text) / 100;
      _parent.txt_D_2.text = Number(_parent.txtSlope_2.text) / 100;
      intTempVal_1 = 100;
      intTempVal_2 = Number(_parent.txtSlope_1.text);
      intTempFinal_1 = intTempVal_1 / intTempVal_2;
      if(intTempFinal_1.toString().indexOf(".") == -1)
      {
         _parent.txt_F_1_N.text = "1";
         _parent.txt_F_1_D.text = intTempFinal_1;
      }
      else if(intTempFinal_1.toString().indexOf(".") != -1)
      {
         intTempFinal_2 = 10 * (intTempVal_2 / intTempVal_1);
         if(intTempFinal_2.toString().indexOf(".") == -1)
         {
            _parent.txt_F_1_N.text = Number(_parent.txtSlope_1.text) / 20;
            _parent.txt_F_1_D.text = 5;
         }
         else
         {
            intTempFinal_3 = Number(_parent.txtSlope_1.text) / 2;
            if(intTempFinal_3.toString().indexOf(".") == -1)
            {
               _parent.txt_F_1_N.text = Number(_parent.txtSlope_1.text) / 2;
               _parent.txt_F_1_D.text = 50;
            }
            else
            {
               _parent.txt_F_1_N.text = Number(_parent.txtSlope_1.text);
               _parent.txt_F_1_D.text = 100;
            }
         }
      }
      intTempVal_1 = 100;
      intTempVal_2 = Number(_parent.txtSlope_2.text);
      intTempFinal_1 = intTempVal_1 / intTempVal_2;
      if(intTempFinal_1.toString().indexOf(".") == -1)
      {
         _parent.txt_F_2_N.text = "1";
         _parent.txt_F_2_D.text = intTempFinal_1;
      }
      else if(intTempFinal_1.toString().indexOf(".") != -1)
      {
         intTempFinal_2 = 10 * (intTempVal_2 / intTempVal_1);
         if(intTempFinal_2.toString().indexOf(".") == -1)
         {
            _parent.txt_F_2_N.text = Number(_parent.txtSlope_2.text) / 20;
            _parent.txt_F_2_D.text = 5;
         }
         else
         {
            intTempFinal_3 = Number(_parent.txtSlope_2.text) / 2;
            if(intTempFinal_3.toString().indexOf(".") == -1)
            {
               _parent.txt_F_2_N.text = Number(_parent.txtSlope_2.text) / 2;
               _parent.txt_F_2_D.text = 50;
            }
            else
            {
               _parent.txt_F_2_N.text = Number(_parent.txtSlope_2.text);
               _parent.txt_F_2_D.text = 100;
            }
         }
      }
   }
}
