on(press){
   drag = true;
   startDrag(this,1,_global.sX_3 - 20,_parent.Mc_Drag_Line_3._y,_global.eX_3 - 80,_parent.Mc_Drag_Line_3._y);
   _global.checkValue_3 = Number(_parent.txtSlope_3.text);
   _global.addValue_3 = Number(_parent.txtSlope_4.text);
   _global.setX_3 = _parent.Mc_Drag_4._x;
   _global.checkX_3 = this._x;
   _parent.Mc_Chart_Circle_3._rotation = 180;
   _parent.Mc_Chart_Circle_4._rotation = 0;
   _parent.Mc_Chart_Circle_3.gotoAndStop(Number(_parent.txtSlope_3.text) + 1);
   _parent.Mc_Chart_Circle_4.gotoAndStop(51);
}
