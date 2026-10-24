function DoUpdates(NewVal)
{
   SliderText.text = NewVal;
   _parent._parent.UpdateSlope(NewVal);
}
SlideMin = -10;
SlideMax = 10;
StartVal = 1;
slider._x = (sliderTrack._width - slider._width) / ((SlideMax - SlideMin) / (StartVal - SlideMin));
sliderTrack._visible = false;
DoUpdates(StartVal);
