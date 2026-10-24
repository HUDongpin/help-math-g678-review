onClipEvent(enterFrame){
   if(isDragging)
   {
      TheVal = (SlideMax - SlideMin) / ((sliderTrack._width - slider._width) / slider._x) + SlideMin;
      TheVal = Math.round(TheVal * 10) / 10;
      DoUpdates(TheVal);
   }
}
