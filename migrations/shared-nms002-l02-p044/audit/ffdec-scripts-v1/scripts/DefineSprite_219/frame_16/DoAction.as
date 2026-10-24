i = 1;
while(i <= 20)
{
   theColor = new Color(eval("Mc_" + i));
   theColor.setRGB(16777215);
   i++;
}
if(_global.showAns)
{
   i = 1;
   while(i <= parseInt(_parent.txtNum.text))
   {
      tempMcName = "Mc_" + i;
      theColor = new Color(eval(tempMcName));
      theColor.setRGB(16768392);
      i++;
   }
}
