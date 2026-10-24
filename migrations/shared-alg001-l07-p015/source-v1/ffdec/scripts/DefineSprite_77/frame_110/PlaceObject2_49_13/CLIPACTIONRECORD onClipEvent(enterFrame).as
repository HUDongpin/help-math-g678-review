onClipEvent(enterFrame){
   if(drag)
   {
      tempVal = Math.round((this._x / 10 + 5) * 10) / 10;
      trace(tempVal);
      _parent.txtSlope.text = tempVal;
   }
}
