on(release){
   _global.mcSelCount = 0;
   if(_global.intPicCount < 20)
   {
      _global.intPicCount++;
   }
   if(_global.PartsCount < 20)
   {
      _global.PartsCount++;
      txtParts.text = _global.PartsCount;
   }
   frmLbl = "L" + _global.intPicCount;
   Mc_Main.gotoAndStop(frmLbl);
   if(_global.intPicCount > 1)
   {
      txtParts.text = _global.intPicCount + " Pieces";
   }
   else
   {
      txtParts.text = _global.intPicCount + " Piece";
   }
}
