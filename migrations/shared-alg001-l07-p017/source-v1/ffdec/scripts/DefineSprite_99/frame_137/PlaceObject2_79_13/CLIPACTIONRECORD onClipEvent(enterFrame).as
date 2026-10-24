onClipEvent(enterFrame){
   if(drag)
   {
      tempVal = Math.round(this._x / 10 - 3);
      _parent.txtSlope.text = tempVal;
   }
}
