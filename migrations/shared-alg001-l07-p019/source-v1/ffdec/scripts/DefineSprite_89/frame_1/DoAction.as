if(!_load)
{
   _load = 1;
   tellTarget("..")
   {
      SlideMin = -10;
      SlideMax = 10;
      StartVal = 1;
      slider._x = (sliderTrack._width - slider._width) / ((SlideMax - SlideMin) / (StartVal - SlideMin));
      sliderTrack._visible = false;
      DoUpdates(StartVal);
   }
}
nextFrame();
play();
