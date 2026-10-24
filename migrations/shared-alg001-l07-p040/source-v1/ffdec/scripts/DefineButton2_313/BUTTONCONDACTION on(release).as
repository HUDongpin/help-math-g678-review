on(release){
   _parent.gotoAndPlay(22);
   i = 1;
   while(i <= 4)
   {
      eval("AnsBtn" + i).gotoAndStop(1);
      i++;
   }
}
