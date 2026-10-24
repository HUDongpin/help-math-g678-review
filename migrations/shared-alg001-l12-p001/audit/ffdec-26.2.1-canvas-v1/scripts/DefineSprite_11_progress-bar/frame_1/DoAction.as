function setProgressBar()
{
   var _loc1_ = 110 * _parent._parent._framesloaded / _parent._parent._totalframes;
   progressBar._width = _loc1_;
   progressBar._visible = false;
}
function setDraggerPosition()
{
   var _loc1_ = 110 * _parent._parent._currentframe / _parent._parent._totalframes;
   drag_But._x = _loc1_;
}
function startDragger()
{
   gotoAndStop(2);
   var _loc1_ = progressBar._x;
   var _loc2_ = progressBar._width + progressBar._x;
   startDrag("drag_But",0,_loc1_,progressBar._y,_loc2_,progressBar._y);
}
function stopDragger()
{
   var _loc1_ = _parent;
   gotoAndStop(1);
   stopDrag();
   if(_loc1_._parent._currentframe != _loc1_._parent._totalframes)
   {
      _loc1_._parent.play();
   }
}
function setMediaFrame()
{
   var _loc1_ = int(drag_But._x / 110 * _parent._parent._totalframes) + 1;
   _parent._parent.gotoAndStop(_loc1_);
}
stop();
