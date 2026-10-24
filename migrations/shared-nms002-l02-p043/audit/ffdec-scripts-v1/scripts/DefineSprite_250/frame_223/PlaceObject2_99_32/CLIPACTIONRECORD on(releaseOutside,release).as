on(releaseOutside,release){
   stopDrag();
   tempSplSrc = this._name.split("_");
   if(eval(this._droptarget) == _parent["Mc_Tar_" + tempSplSrc[tempSplSrc.length - 1]])
   {
      _global.quizDragCount++;
      _parent["Mc_Tar_" + tempSplSrc[tempSplSrc.length - 1]]._alpha = 100;
      _parent.disableButton();
      if(_root.dtfClicks.text.toUpperCase() == "ON")
      {
         _root.strIndividualButttonClickType = "FEED";
         strTempIndividualClickDesc = "Correct";
         _root.strIndividualClickDesc = strTempIndividualClickDesc;
         _root.strFinalClickURL = "";
         _root.Send_Click_Report_Mc.gotoAndPlay(6);
      }
      _parent.Coach_audio_2.gotoAndPlay(2);
      this._visible = false;
   }
   else
   {
      this._x = oX;
      this._y = oY;
      _parent.disableButton();
      if(_root.dtfClicks.text.toUpperCase() == "ON")
      {
         _root.strIndividualButttonClickType = "FEED";
         strTempIndividualClickDesc = "Incorrect";
         _root.strIndividualClickDesc = strTempIndividualClickDesc;
         _root.strFinalClickURL = "";
         _root.Send_Click_Report_Mc.gotoAndPlay(6);
      }
      _parent.Pop1_mc._visible = true;
      _parent.Pop1_mc.gotoAndPlay(2);
   }
}
