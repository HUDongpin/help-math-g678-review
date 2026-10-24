onClipEvent(enterFrame){
   if(Number(_parent.txtSlope_4.text) <= 0 && this._x >= -99)
   {
      this._x = -99;
   }
   if(drag)
   {
      _global.cX_3 = this._x;
      tempVal_3 = Math.round(this._x / 1.72 + 108);
      _parent.txtSlope_3.text = tempVal_3;
      tempAddValue_3 = Number(_parent.txtSlope_3.text) - _global.checkValue_3;
      if(tempVal_3 > _global.checkValue_3)
      {
         tempSetX_3 = _global.setX_3 - tempAddValue_3;
         _parent.txtSlope_4.text = _global.addValue_3 - tempAddValue_3;
         _parent.Mc_Drag_4._x = tempSetX_3;
      }
      else
      {
         tempSetX_3 = _global.setX_3 + tempAddValue_3 * -1;
         _parent.txtSlope_4.text = _global.addValue_3 + tempAddValue_3 * -1;
         _parent.Mc_Drag_4._x = tempSetX_3;
      }
      if(Number(_parent.txtSlope_4.text) <= 0)
      {
         _parent.Mc_Drag_4._x = -185;
      }
      if(Number(_parent.txtSlope_4.text) >= 50)
      {
         _parent.Mc_Drag_4._x = -99;
      }
      if(Number(_parent.txtSlope_4.text) == 25)
      {
         _parent.Mc_Drag_4._x = this._x;
      }
      _parent.txt_P_3.text = _parent.txtSlope_3.text + " %";
      _parent.txt_P_4.text = _parent.txtSlope_4.text + " %";
      _parent.txt_D_3.text = Number(_parent.txtSlope_3.text) / 100;
      _parent.txt_D_4.text = Number(_parent.txtSlope_4.text) / 100;
      intTempVal_1 = 100;
      intTempVal_2 = Number(_parent.txtSlope_3.text);
      intTempFinal_1 = intTempVal_1 / intTempVal_2;
      if(intTempFinal_1.toString().indexOf(".") == -1)
      {
         _parent.txt_F_3_N.text = "1";
         _parent.txt_F_3_D.text = intTempFinal_1;
      }
      else if(intTempFinal_1.toString().indexOf(".") != -1)
      {
         intTempFinal_2 = 10 * (intTempVal_2 / intTempVal_1);
         if(intTempFinal_2.toString().indexOf(".") == -1)
         {
            _parent.txt_F_3_N.text = Number(_parent.txtSlope_3.text) / 20;
            _parent.txt_F_3_D.text = 5;
         }
         else
         {
            intTempFinal_3 = Number(_parent.txtSlope_3.text) / 2;
            if(intTempFinal_3.toString().indexOf(".") == -1)
            {
               _parent.txt_F_3_N.text = Number(_parent.txtSlope_3.text) / 2;
               _parent.txt_F_3_D.text = 50;
            }
            else
            {
               _parent.txt_F_3_N.text = Number(_parent.txtSlope_3.text);
               _parent.txt_F_3_D.text = 100;
            }
         }
      }
      intTempVal_1 = 100;
      intTempVal_2 = Number(_parent.txtSlope_4.text);
      intTempFinal_1 = intTempVal_1 / intTempVal_2;
      if(intTempFinal_1.toString().indexOf(".") == -1)
      {
         _parent.txt_F_4_N.text = "1";
         _parent.txt_F_4_D.text = intTempFinal_1;
      }
      else if(intTempFinal_1.toString().indexOf(".") != -1)
      {
         intTempFinal_2 = 10 * (intTempVal_2 / intTempVal_1);
         if(intTempFinal_2.toString().indexOf(".") == -1)
         {
            _parent.txt_F_4_N.text = Number(_parent.txtSlope_4.text) / 20;
            _parent.txt_F_4_D.text = 5;
         }
         else
         {
            intTempFinal_3 = Number(_parent.txtSlope_4.text) / 2;
            if(intTempFinal_3.toString().indexOf(".") == -1)
            {
               _parent.txt_F_4_N.text = Number(_parent.txtSlope_4.text) / 2;
               _parent.txt_F_4_D.text = 50;
            }
            else
            {
               _parent.txt_F_4_N.text = Number(_parent.txtSlope_4.text);
               _parent.txt_F_4_D.text = 100;
            }
         }
      }
   }
}
