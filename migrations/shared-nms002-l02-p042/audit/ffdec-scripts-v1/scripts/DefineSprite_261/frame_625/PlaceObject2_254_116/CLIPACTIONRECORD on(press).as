on(press){
   drag = true;
   startDrag(this,1,_global.sX_2 - 20,_parent.Mc_Drag_Line_2._y,_global.eX_2 - 80,_parent.Mc_Drag_Line_2._y);
   _global.checkValue_2 = Number(_parent.txtSlope_2.text);
   _global.addValue_2 = Number(_parent.txtSlope_3.text);
   _global.setX_2 = _parent.Mc_Drag_3._x;
   _global.checkX_2 = this._x;
   if(Number(_parent.txtSlope_2.text) == 0)
   {
      _parent.Mc_Chart_Circle_2._rotation = 180;
   }
   else
   {
      _parent.Mc_Chart_Circle_2._rotation = 270;
   }
   _parent.Mc_Chart_Circle_3._rotation = 270;
   _parent.Mc_Chart_Circle_2.gotoAndStop(Number(_parent.txtSlope_2.text) + 1);
   _parent.Mc_Chart_Circle_3.gotoAndStop(51);
}
