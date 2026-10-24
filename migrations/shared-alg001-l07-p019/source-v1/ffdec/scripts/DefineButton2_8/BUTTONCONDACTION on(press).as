on(press){
   _parent.isDragging = true;
   this.startDrag(false,0,this._y,_parent.sliderTrack._width - this._width,this._y);
}
