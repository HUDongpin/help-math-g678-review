function doSelectMc(mcName)
{
   theColor = new Color(mcName);
   if(theColor.getRGB() == 16777215)
   {
      theColor.setRGB(16768392);
      _global.mcSelCount++;
   }
   else
   {
      theColor.setRGB(16777215);
      _global.mcSelCount--;
   }
}
stop();
