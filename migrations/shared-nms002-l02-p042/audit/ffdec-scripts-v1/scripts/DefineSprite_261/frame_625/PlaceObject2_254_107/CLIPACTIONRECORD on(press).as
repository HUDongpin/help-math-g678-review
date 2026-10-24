on(press){
   drag = true;
   startDrag(this,1,_global.sX_1 - 20,_parent.Mc_Drag_Line_1._y,_global.eX_1 - 80,_parent.Mc_Drag_Line_1._y);
   _global.checkValue_1 = Number(_parent.txtSlope_1.text);
   _global.addValue_1 = Number(_parent.txtSlope_2.text);
   _global.setX_1 = _parent.Mc_Drag_2._x;
   _global.checkX_1 = this._x;
   _parent.Mc_Chart_Circle_1._rotation = 0;
   _parent.Mc_Chart_Circle_2._rotation = 0;
   _parent.Mc_Chart_Circle_1.gotoAndStop(Number(_parent.txtSlope_1.text) + 1);
   _parent.Mc_Chart_Circle_2.gotoAndStop(51);
}
