on(release, releaseOutside){
   stopDrag();
   _global.startDragMc = true;
   if(this._name == "h1")
   {
      if(this.hitTest(_parent.Mc_1))
      {
         this._x = _parent.Mc_1._x;
      }
      if(this.hitTest(_parent.Mc_3))
      {
         this._x = _parent.Mc_3._x;
      }
      if(this.hitTest(_parent.Mc_5))
      {
         this._x = _parent.Mc_5._x;
      }
      if(this.hitTest(_parent.Mc_7))
      {
         this._x = _parent.Mc_7._x;
      }
      if(this.hitTest(_parent.Mc_2))
      {
         this._x = _parent.Mc_2._x;
      }
      if(this.hitTest(_parent.Mc_4))
      {
         this._x = _parent.Mc_4._x;
      }
      if(this.hitTest(_parent.Mc_6))
      {
         this._x = _parent.Mc_6._x;
      }
      if(this.hitTest(_parent.Mc_8))
      {
         this._x = _parent.Mc_8._x;
      }
      if(!(this._x == -48 && this._y == 61))
      {
         this._parent.BtnDone.enabled = true;
      }
   }
   else
   {
      if(this.hitTest(_parent.Mc_1))
      {
         this._x = _parent.Mc_1._x;
      }
      if(this.hitTest(_parent.Mc_3))
      {
         this._x = _parent.Mc_3._x;
      }
      if(this.hitTest(_parent.Mc_5))
      {
         this._x = _parent.Mc_5._x;
      }
      if(this.hitTest(_parent.Mc_7))
      {
         this._x = _parent.Mc_7._x;
      }
      if(this.hitTest(_parent.Mc_2))
      {
         this._x = _parent.Mc_2._x;
      }
      if(this.hitTest(_parent.Mc_4))
      {
         this._x = _parent.Mc_4._x;
      }
      if(this.hitTest(_parent.Mc_6))
      {
         this._x = _parent.Mc_6._x;
      }
      if(this.hitTest(_parent.Mc_8))
      {
         this._x = _parent.Mc_8._x;
      }
      if(!(this._x == 67 && this._y == 61))
      {
         this._parent.BtnDone.enabled = true;
      }
   }
}
