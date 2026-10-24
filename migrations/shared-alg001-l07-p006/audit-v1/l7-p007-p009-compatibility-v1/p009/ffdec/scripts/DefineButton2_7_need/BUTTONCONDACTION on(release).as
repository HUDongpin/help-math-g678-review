on(release){
   Entry_Btn.enabled = false;
   Xinput = IP1_txt.text;
   Yinput = IP2_txt.text;
   AddCon = IP3_txt.text;
   if(Xinput == "" || Yinput == "" || AddCon == "")
   {
      OP_txt.text = "";
      Hint._visible = true;
   }
   else
   {
      if(Xinput.indexOf("/") != -1)
      {
         splX = Xinput.split("/");
         Xinput = parseFloat(splX[0]) / parseFloat(splX[1]);
      }
      if(Yinput.indexOf("/") != -1)
      {
         splY = Yinput.split("/");
         Yinput = parseFloat(splY[0]) / parseFloat(splY[1]);
      }
      if(AddCon.indexOf("/") != -1)
      {
         splAddcon = AddCon.split("/");
         AddCon = parseFloat(splAddcon[0]) / parseFloat(splAddcon[1]);
      }
      if(Yinput * Xinput + Number(AddCon) == NaN)
      {
         OP_txt.text = "";
      }
      else
      {
         OP_txt.text = Yinput * Xinput + Number(AddCon);
      }
      New_fn.enabled = true;
   }
}
