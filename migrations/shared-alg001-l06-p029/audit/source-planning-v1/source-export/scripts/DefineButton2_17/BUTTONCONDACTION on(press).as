on(press){
   if(opt_try == 4)
   {
      corr.gotoAndPlay(2);
      Wrong.gotoAndStop(1);
      opt_try = 0;
   }
   else
   {
      Wrong.gotoAndPlay(2);
      corr.gotoAndStop(1);
      opt_try = 0;
   }
}
