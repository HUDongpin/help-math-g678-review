on(release){
   _parent.gotoAndPlay(21);
   i = 1;
   while(i <= 4)
   {
      eval("AnsBtn" + i).gotoAndStop(1);
      i++;
   }
}
