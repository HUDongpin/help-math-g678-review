function doPlayFQAudio(strPlayPauseMc)
{
   eval(strPlayPauseMc).gotoAndStop(2);
   _global.sndFQSound.start();
}

function doPauseFQAudio(strPlayPauseMc)
{
   eval(strPlayPauseMc).gotoAndStop(1);
   _global.sndFQSound.stop();
}

function doPlayFQQuestionAudio(strFQMc, strLNG)
{
   _global.sndFQSound.stop();
   _global.sndFQSound.unLoad();
   if(eval(strFQMc).Mc_PlayPause_Audio._currentframe == 2)
   {
      if(_global.strLNG == strLNG)
      {
         eval(strFQMc).Mc_PlayPause_Audio.gotoAndStop(1);
         _global.sndFQSound.stop();
         _global.sndFQSound.unLoad();
      }
      else
      {
         _root.animation_mc.animation.Mc_Quiz_Audio.Mc_PlayPause_Audio.gotoAndStop(1);
         i = 1;
         while(i <= 4)
         {
            eval("_root.animation_mc.animation.Mc_Quiz_Audio_" + i).Mc_PlayPause_Audio.gotoAndStop(1);
            i++;
         }
         strFQTempLabel = "Q" + Number(_root.animation_mc.animation._currentframe - 1).toString();
         _global.strFQTempLabel = strFQTempLabel;
         splitRootFQQuestionAudioURL = _global.playSwfFileName.split("/");
         strFQQuestionAudioURL = "";
         i = 0;
         while(i < splitRootFQQuestionAudioURL.length - 1)
         {
            if(strFQQuestionAudioURL == "")
            {
               strFQQuestionAudioURL = splitRootFQQuestionAudioURL[i];
            }
            else
            {
               strFQQuestionAudioURL = strFQQuestionAudioURL + "/" + splitRootFQQuestionAudioURL[i];
            }
            i++;
         }
         switch(strLNG)
         {
            case "EN":
               strFQQuestionAudioURL = strFQQuestionAudioURL + "/EA/" + strFQTempLabel + ".mp3";
               break;
            case "SP":
               strFQQuestionAudioURL = strFQQuestionAudioURL + "/SA/" + strFQTempLabel + ".mp3";
         }
         _global.sndFQSound = new Sound();
         _global.sndFQSound.onLoad = function(success)
         {
            if(success)
            {
               _global.sndFQSound.start(0);
               eval(strFQMc).Mc_PlayPause_Audio.gotoAndStop(2);
            }
         };
         _global.sndFQSound.loadSound(strFQQuestionAudioURL,false);
         _global.sndFQSound.onSoundComplete = function()
         {
            eval(strFQMc).Mc_PlayPause_Audio.gotoAndStop(1);
            _global.sndFQSound.stop();
            _global.sndFQSound.unLoad();
         };
         _global.strLNG = strLNG;
      }
   }
   else
   {
      _root.animation_mc.animation.Mc_Quiz_Audio.Mc_PlayPause_Audio.gotoAndStop(1);
      i = 1;
      while(i <= 4)
      {
         eval("_root.animation_mc.animation.Mc_Quiz_Audio_" + i).Mc_PlayPause_Audio.gotoAndStop(1);
         i++;
      }
      strFQTempLabel = "Q" + Number(_root.animation_mc.animation._currentframe - 1).toString();
      _global.strFQTempLabel = strFQTempLabel;
      splitRootFQQuestionAudioURL = _global.playSwfFileName.split("/");
      strFQQuestionAudioURL = "";
      i = 0;
      while(i < splitRootFQQuestionAudioURL.length - 1)
      {
         if(strFQQuestionAudioURL == "")
         {
            strFQQuestionAudioURL = splitRootFQQuestionAudioURL[i];
         }
         else
         {
            strFQQuestionAudioURL = strFQQuestionAudioURL + "/" + splitRootFQQuestionAudioURL[i];
         }
         i++;
      }
      switch(strLNG)
      {
         case "EN":
            strFQQuestionAudioURL = strFQQuestionAudioURL + "/EA/" + strFQTempLabel + ".mp3";
            break;
         case "SP":
            strFQQuestionAudioURL = strFQQuestionAudioURL + "/SA/" + strFQTempLabel + ".mp3";
      }
      _global.sndFQSound = new Sound();
      _global.sndFQSound.onLoad = function(success)
      {
         if(success)
         {
            _global.sndFQSound.start(0);
            eval(strFQMc).Mc_PlayPause_Audio.gotoAndStop(2);
         }
      };
      _global.sndFQSound.loadSound(strFQQuestionAudioURL,false);
      _global.sndFQSound.onSoundComplete = function()
      {
         eval(strFQMc).Mc_PlayPause_Audio.gotoAndStop(1);
         _global.sndFQSound.stop();
         _global.sndFQSound.unLoad();
      };
      _global.strLNG = strLNG;
   }
   if(_root.dtfLESSON.text == "2" || _root.dtfLESSON.text == "6" || _root.dtfLESSON.text == "11" || _root.dtfLESSON.text == "12" || _root.dtfLESSON.text == "13" || _root.dtfLESSON.text == "14" || _root.dtfLESSON.text == "34" || _root.dtfLESSON.text == "38" || _root.dtfLESSON.text == "4" || _root.dtfLESSON.text == "5" || _root.dtfLESSON.text == "10")
   {
      boolFQClickRecord = true;
   }
   if(boolFQClickRecord && _root.dtfClicks.text.toUpperCase() == "ON" && _root.boolMcVisible == false)
   {
      if(eval(strFQMc).Mc_PlayPause_Audio._currentframe == 1)
      {
         switch(strLNG)
         {
            case "EN":
               _root.strIndividualButttonClickType = "ENFQQUES";
               break;
            case "SP":
               _root.strIndividualButttonClickType = "SPFQQUES";
         }
         strTempIndividualClickDesc = _global.strFQTempLabel;
         strTempIndividualClickDesc = strTempIndividualClickDesc.split("&").join("ANDSYM");
         _root.strIndividualClickDesc = strTempIndividualClickDesc;
         _root.strFinalClickURL = "";
         _root.Send_Click_Report_Mc.gotoAndPlay(6);
      }
   }
}

function doPlayFQAnswerAudio(strFQMc, strLNG)
{
   _global.sndFQSound.stop();
   _global.sndFQSound.unLoad();
   if(eval(strFQMc).Mc_PlayPause_Audio._currentframe == 2)
   {
      if(_global.strLNG == strLNG)
      {
         eval(strFQMc).Mc_PlayPause_Audio.gotoAndStop(1);
         _global.sndFQSound.stop();
         _global.sndFQSound.unLoad();
      }
      else
      {
         _root.animation_mc.animation.Mc_Quiz_Audio.Mc_PlayPause_Audio.gotoAndStop(1);
         i = 1;
         while(i <= 4)
         {
            eval("_root.animation_mc.animation.Mc_Quiz_Audio_" + i).Mc_PlayPause_Audio.gotoAndStop(1);
            i++;
         }
         strFQTempLabel = "Q" + Number(_root.animation_mc.animation._currentframe - 1).toString();
         _global.strFQTempLabel = strFQTempLabel;
         splitRootFQAnswerAudioURL = _global.playSwfFileName.split("/");
         strFQAnswerAudioURL = "";
         i = 0;
         while(i < splitRootFQAnswerAudioURL.length - 1)
         {
            if(strFQAnswerAudioURL == "")
            {
               strFQAnswerAudioURL = splitRootFQAnswerAudioURL[i];
            }
            else
            {
               strFQAnswerAudioURL = strFQAnswerAudioURL + "/" + splitRootFQAnswerAudioURL[i];
            }
            i++;
         }
         var §strQALabel:String§ = "";
         var §intOptID:Number§ = 0;
         var §strTempQAName:String§ = "";
         strTempQAName = eval(strFQMc)._name;
         strQAFName = "";
         intOptID = Number(strTempQAName.substring(strTempQAName.length - 1,strTempQAName.length));
         switch(intOptID)
         {
            case 1:
               strQALabel = "A";
               break;
            case 2:
               strQALabel = "B";
               break;
            case 3:
               strQALabel = "C";
               break;
            case 4:
               strQALabel = "D";
         }
         strQAFName = strFQTempLabel + strQALabel + ".mp3";
         switch(strLNG)
         {
            case "EN":
               strFQAnswerAudioURL = strFQAnswerAudioURL + "/EA/" + strQAFName;
               break;
            case "SP":
               strFQAnswerAudioURL = strFQAnswerAudioURL + "/SA/" + strQAFName;
         }
         _global.sndFQSound = new Sound();
         _global.sndFQSound.onLoad = function(success)
         {
            if(success)
            {
               _global.sndFQSound.start(0);
               eval(strFQMc).Mc_PlayPause_Audio.gotoAndStop(2);
            }
         };
         _global.sndFQSound.loadSound(strFQAnswerAudioURL,false);
         _global.sndFQSound.onSoundComplete = function()
         {
            eval(strFQMc).Mc_PlayPause_Audio.gotoAndStop(1);
            _global.sndFQSound.stop();
            _global.sndFQSound.unLoad();
         };
         _global.strLNG = strLNG;
      }
   }
   else
   {
      _root.animation_mc.animation.Mc_Quiz_Audio.Mc_PlayPause_Audio.gotoAndStop(1);
      i = 1;
      while(i <= 4)
      {
         eval("_root.animation_mc.animation.Mc_Quiz_Audio_" + i).Mc_PlayPause_Audio.gotoAndStop(1);
         i++;
      }
      strFQTempLabel = "Q" + Number(_root.animation_mc.animation._currentframe - 1).toString();
      _global.strFQTempLabel = strFQTempLabel;
      splitRootFQAnswerAudioURL = _global.playSwfFileName.split("/");
      strFQAnswerAudioURL = "";
      i = 0;
      while(i < splitRootFQAnswerAudioURL.length - 1)
      {
         if(strFQAnswerAudioURL == "")
         {
            strFQAnswerAudioURL = splitRootFQAnswerAudioURL[i];
         }
         else
         {
            strFQAnswerAudioURL = strFQAnswerAudioURL + "/" + splitRootFQAnswerAudioURL[i];
         }
         i++;
      }
      var §strQALabel:String§ = "";
      var §intOptID:Number§ = 0;
      var §strTempQAName:String§ = "";
      strTempQAName = eval(strFQMc)._name;
      strQAFName = "";
      intOptID = Number(strTempQAName.substring(strTempQAName.length - 1,strTempQAName.length));
      switch(intOptID)
      {
         case 1:
            strQALabel = "A";
            break;
         case 2:
            strQALabel = "B";
            break;
         case 3:
            strQALabel = "C";
            break;
         case 4:
            strQALabel = "D";
      }
      strQAFName = strFQTempLabel + strQALabel + ".mp3";
      switch(strLNG)
      {
         case "EN":
            strFQAnswerAudioURL = strFQAnswerAudioURL + "/EA/" + strQAFName;
            break;
         case "SP":
            strFQAnswerAudioURL = strFQAnswerAudioURL + "/SA/" + strQAFName;
      }
      _global.sndFQSound = new Sound();
      _global.sndFQSound.onLoad = function(success)
      {
         if(success)
         {
            _global.sndFQSound.start(0);
            eval(strFQMc).Mc_PlayPause_Audio.gotoAndStop(2);
         }
      };
      _global.sndFQSound.loadSound(strFQAnswerAudioURL,false);
      _global.sndFQSound.onSoundComplete = function()
      {
         eval(strFQMc).Mc_PlayPause_Audio.gotoAndStop(1);
         _global.sndFQSound.stop();
         _global.sndFQSound.unLoad();
      };
      _global.strLNG = strLNG;
   }
   if(_root.dtfLESSON.text == "2" || _root.dtfLESSON.text == "6" || _root.dtfLESSON.text == "11" || _root.dtfLESSON.text == "12" || _root.dtfLESSON.text == "13" || _root.dtfLESSON.text == "14" || _root.dtfLESSON.text == "34" || _root.dtfLESSON.text == "38" || _root.dtfLESSON.text == "4" || _root.dtfLESSON.text == "5" || _root.dtfLESSON.text == "10")
   {
      boolFQClickRecord = true;
   }
   if(boolFQClickRecord && _root.dtfClicks.text.toUpperCase() == "ON" && _root.boolMcVisible == false)
   {
      if(eval(strFQMc).Mc_PlayPause_Audio._currentframe == 1)
      {
         switch(strLNG)
         {
            case "EN":
               _root.strIndividualButttonClickType = "ENFQANS";
               break;
            case "SP":
               _root.strIndividualButttonClickType = "SPFQANS";
         }
         strTempIndividualClickDesc = _global.strFQTempLabel + "Option" + strQALabel;
         strTempIndividualClickDesc = strTempIndividualClickDesc.split("&").join("ANDSYM");
         _root.strIndividualClickDesc = strTempIndividualClickDesc;
         _root.strFinalClickURL = "";
         _root.Send_Click_Report_Mc.gotoAndPlay(6);
      }
   }
}
