function getBookMark()
{
   var _loc1_ = _global;
   var _loc2_ = _root;
   for(var _loc3_ in myCookie.data)
   {
      _loc1_.arrayFLCookie.push(myCookie.data[_loc3_]);
      tempFLCookieCount++;
   }
   lessonNum = _loc2_.Lesson_ID;
   i = 0;
   if(i < _loc1_.arrayFLCookie.length)
   {
      tempSplFLC = _loc1_.arrayFLCookie[i].split("~");
      tempFLCCheckVal = "L" add lessonNum;
      if(tempFLCCheckVal == tempSplFLC[0])
      {
         _loc2_.Bookmark_URL = tempSplFLC[1];
      }
   }
}
function setBookMark()
{
   var _loc1_ = _global;
   lessonNum = _root.Lesson_ID;
   tempINFLCVal = "L" add lessonNum;
   myCookie.clear();
   i = 0;
   if(i < _loc1_.arrayFLCookie.length)
   {
      tempSplFLC = _loc1_.arrayFLCookie[i].split("~");
      tempFLCCheckVal = "L" add lessonNum;
      if(tempFLCCheckVal == tempSplFLC[0])
      {
         _loc1_.arrayFLCookie.splice(i,1);
      }
   }
   _loc1_.BmId = _loc1_.splitStart + "SPLDATA" + _loc1_.splitEnd + "SPLDATA" + _loc1_.sectionNumber + "SPLDATA" + _loc1_.slideNumber + "SPLDATA" + _loc1_.playSwfFileName;
   _loc1_.arrayFLCookie.push(tempINFLCVal add "~" add _loc1_.BmId);
   i = 0;
   while(i < _loc1_.arrayFLCookie.length)
   {
      myCookie.data[i] = _loc1_.arrayFLCookie[i];
      myCookie.flush();
      i++;
   }
}
function doRemoveSquare()
{
   var _loc2_ = _root;
   var _loc3_ = _global;
   var flgExists;
   var _loc1_;
   var intSlideNum;
   tempArrSplit = _loc2_.pageNames.split("SECSPL");
   i = 0;
   while(i < _loc3_.arrayTotalSectionDetails.length)
   {
      newTempSpl = _loc3_.arrayTotalSectionDetails[i].split("~");
      j = 2;
      while(j < newTempSpl.length)
      {
         splTempChkName = newTempSpl[j].substring(0,newTempSpl[j].length - 4).split("/");
         tempMcName = "";
         k = 0;
         while(k < splTempChkName.length)
         {
            if(tempMcName == "")
            {
               tempMcName = splTempChkName[k];
            }
            else
            {
               tempMcName = tempMcName + "," + splTempChkName[k];
            }
            k++;
         }
         _loc1_ = tempMcName;
         removeMovieClip(_loc2_[_loc1_]);
         j++;
      }
      i++;
   }
}
function doCreateSlide()
{
   var flgExists;
   var mcName;
   var intSlideNum;
   tempArrSplit = _root.pageNames.split("SECSPL");
   i = 0;
   while(i < _global.arrayTotalSectionDetails.length)
   {
      newTempSpl = _global.arrayTotalSectionDetails[i].split("~");
      j = 2;
      while(j < newTempSpl.length)
      {
         splTempChkName = newTempSpl[j].substring(0,newTempSpl[j].length - 4).split("/");
         tempMcName = "";
         k = 0;
         while(k < splTempChkName.length)
         {
            if(tempMcName == "")
            {
               tempMcName = splTempChkName[k];
            }
            else
            {
               tempMcName = tempMcName + "," + splTempChkName[k];
            }
            k++;
         }
         mcName = tempMcName;
         removeMovieClip(_root[mcName]);
         j++;
      }
      i++;
   }
   if(_global.sectionNumber >= 0 && _global.sectionNumber < _global.arrayTotalSectionDetails.length)
   {
      slideName = new Array();
      tempArrSectionSplit = _global.arrayTotalSectionDetails[_global.sectionNumber].split("~");
      tempSplSlideName = tempArrSplit[_global.sectionNumber].split("~");
      i = 0;
      while(i < tempSplSlideName.length)
      {
         slideName.push(tempSplSlideName[i]);
         i++;
      }
      mcX = 15.5;
      intSlideNum = 0;
      i = 2;
      while(i < tempArrSectionSplit.length)
      {
         intSlideNum++;
         splTempChkName = tempArrSectionSplit[i].substring(0,tempArrSectionSplit[i].length - 4).split("/");
         tempMcName = "";
         j = 0;
         while(j < splTempChkName.length)
         {
            if(tempMcName == "")
            {
               tempMcName = splTempChkName[j];
            }
            else
            {
               tempMcName = tempMcName + "," + splTempChkName[j];
            }
            j++;
         }
         mcName = tempMcName;
         if(_global.newTitleTag == true)
         {
            _global.tempLastSlideName = mcName;
         }
         removeMovieClip(_root[mcName]);
         duplicateMovieClip("_root.Slide_Source",mcName,16384 + intSlideNum);
         if(_root.dtfNoMap.text.toUpperCase() == "YES")
         {
            eval(mcName)._visible = false;
         }
         eval(mcName).SlideNum.SlideNum.text = slideName[intSlideNum - 1];
         if(tempSplSlideName.length < 25)
         {
            if(i == 2)
            {
               eval(mcName)._x = 15.5;
            }
            else
            {
               mcX += 20;
               eval(mcName)._x = mcX;
            }
         }
         else if(i == 2)
         {
            eval(mcName)._x = 15.5;
            eval(mcName)._y = 533;
         }
         else if(i == 24)
         {
            mcX = 15.5;
            eval(mcName)._x = 15.5;
            eval(mcName)._y = 546;
         }
         else if(i < 24)
         {
            mcX += 20;
            eval(mcName)._x = mcX;
            eval(mcName)._y = 533;
         }
         else if(i > 24)
         {
            mcX += 20;
            eval(mcName)._x = mcX;
            eval(mcName)._y = 546;
         }
         eval(mcName).SlideNum._visible = false;
         i++;
      }
   }
}
function doPlayPreviousMovie()
{
   var _loc1_ = _global;
   var _loc2_ = _root;
   _loc2_.doStopSpanishAudio();
   _loc1_.Play = true;
   _loc1_.Pause = false;
   _loc1_.CompClick = "";
   _loc1_.quizSection = false;
   _loc1_.needMoreBackURL = "";
   _loc1_.slideNumber = _loc1_.slideNumber - 1;
   _loc2_.animation_mc.unloadMovie();
   _loc2_.glossary.keyterms.mouse_down._x = _loc2_.glossary.keyterms.x_pos;
   _loc2_.glossary.keyterms.mouse_down._y = _loc2_.glossary.keyterms.y_pos;
   _loc2_.glossary._visible = false;
   _loc2_.calculator._visible = false;
   _loc2_.Mc_Formulas._visible = false;
   _loc2_.m_c._visible = false;
   _loc2_.popup.gotoAndStop(1);
   _loc2_.next_mc.gotoAndStop("inactive");
   _loc2_.replay_mc.gotoAndStop("inactive");
   if(_loc1_.slideNumber < 2)
   {
      _loc1_.sectionNumber = _loc1_.sectionNumber - 1;
      if(_loc1_.sectionNumber <= 0)
      {
         _loc1_.sectionNumber = 0;
         _loc1_.slideNumber = 2;
         newTempSpl = _loc1_.arrayTotalSectionDetails[_loc1_.sectionNumber].split("~");
         _loc1_.playSwfFileName = _loc1_.MainFilePath + newTempSpl[_loc1_.slideNumber];
         _loc2_.doCreateSlide();
         _loc2_.doPutBackAndFinished();
         _loc2_.loadSWFMovie();
      }
      else
      {
         newTempSpl = _loc1_.arrayTotalSectionDetails[_loc1_.sectionNumber].split("~");
         _loc1_.slideNumber = newTempSpl.length - 1;
         _loc1_.playSwfFileName = _loc1_.MainFilePath + newTempSpl[_loc1_.slideNumber];
         _loc2_.doCreateSlide();
         _loc2_.doPutBackAndFinished();
         _loc2_.loadSWFMovie();
      }
   }
   else
   {
      newTempSpl = _loc1_.arrayTotalSectionDetails[_loc1_.sectionNumber].split("~");
      _loc1_.playSwfFileName = _loc1_.MainFilePath + newTempSpl[_loc1_.slideNumber];
      _loc2_.doPutBackAndFinished();
      _loc2_.loadSWFMovie();
   }
}
function doPlayNextMovie()
{
   var _loc1_ = _global;
   var _loc2_ = _root;
   if(_loc1_.newTitleTag == true)
   {
      splTempChkName = _loc1_.playSwfFileName.substring(0,_loc1_.playSwfFileName.length - 4).split("/");
      tempCheckValue = splTempChkName[splTempChkName.length - 5] + "," + splTempChkName[splTempChkName.length - 4] + "," + splTempChkName[splTempChkName.length - 3] + "," + splTempChkName[splTempChkName.length - 2] + "," + splTempChkName[splTempChkName.length - 1];
      if(_loc1_.sectionNumber < _loc1_.arrayTotalSectionDetails.length - 1)
      {
         _loc2_.doStopSpanishAudio();
         _loc1_.Play = true;
         _loc1_.Pause = false;
         _loc1_.CompClick = "";
         _loc1_.quizSection = false;
         _loc1_.needMoreBackURL = "";
         _loc1_.slideNumber = _loc1_.slideNumber + 1;
         _loc2_.animation_mc.unloadMovie();
         _loc2_.glossary.keyterms.mouse_down._x = _loc2_.glossary.keyterms.x_pos;
         _loc2_.glossary.keyterms.mouse_down._y = _loc2_.glossary.keyterms.y_pos;
         _loc2_.glossary._visible = false;
         _loc2_.calculator._visible = false;
         _loc2_.Mc_Formulas._visible = false;
         _loc2_.m_c._visible = false;
         _loc2_.popup.gotoAndStop(1);
         _loc2_.next.gotoAndStop("inactive");
         _loc2_.replay.gotoAndStop("inactive");
         newTempSpl = _loc1_.arrayTotalSectionDetails[_loc1_.sectionNumber].split("~");
         if(_loc1_.slideNumber > newTempSpl.length - 1)
         {
            _loc1_.sectionNumber = _loc1_.sectionNumber + 1;
            if(_loc1_.sectionNumber >= _loc1_.arrayTotalSectionDetails.length)
            {
               _loc1_.sectionNumber = _loc1_.arrayTotalSectionDetails.length - 1;
               newTempSpl = _loc1_.arrayTotalSectionDetails[_loc1_.sectionNumber].split("~");
               _loc1_.slideNumber = newTempSpl.length - 1;
               _loc1_.playSwfFileName = _loc1_.MainFilePath + newTempSpl[_loc1_.slideNumber];
               _loc2_.doCreateSlide();
               _loc2_.doPutBackAndFinished();
               _loc2_.loadSWFMovie();
            }
            else
            {
               newTempSpl = _loc1_.arrayTotalSectionDetails[_loc1_.sectionNumber].split("~");
               _loc1_.slideNumber = 2;
               _loc1_.playSwfFileName = _loc1_.MainFilePath + newTempSpl[_loc1_.slideNumber];
               _loc2_.doCreateSlide();
               _loc2_.doPutBackAndFinished();
               _loc2_.loadSWFMovie();
            }
         }
         else
         {
            newTempSpl = _loc1_.arrayTotalSectionDetails[_loc1_.sectionNumber].split("~");
            _loc1_.playSwfFileName = _loc1_.MainFilePath + newTempSpl[_loc1_.slideNumber];
            _loc2_.doPutBackAndFinished();
            _loc2_.loadSWFMovie();
         }
      }
      else if(tempCheckValue == _loc1_.tempLastSlideName)
      {
         _loc2_.Mc_LC.gotoAndStop(2);
      }
      else
      {
         _loc2_.doStopSpanishAudio();
         _loc1_.Play = true;
         _loc1_.Pause = false;
         _loc1_.CompClick = "";
         _loc1_.quizSection = false;
         _loc1_.needMoreBackURL = "";
         _loc1_.slideNumber = _loc1_.slideNumber + 1;
         _loc2_.animation_mc.unloadMovie();
         _loc2_.glossary.keyterms.mouse_down._x = _loc2_.glossary.keyterms.x_pos;
         _loc2_.glossary.keyterms.mouse_down._y = _loc2_.glossary.keyterms.y_pos;
         _loc2_.glossary._visible = false;
         _loc2_.calculator._visible = false;
         _loc2_.Mc_Formulas._visible = false;
         _loc2_.m_c._visible = false;
         _loc2_.popup.gotoAndStop(1);
         _loc2_.next.gotoAndStop("inactive");
         _loc2_.replay.gotoAndStop("inactive");
         newTempSpl = _loc1_.arrayTotalSectionDetails[_loc1_.sectionNumber].split("~");
         if(_loc1_.slideNumber > newTempSpl.length - 1)
         {
            _loc1_.sectionNumber = _loc1_.sectionNumber + 1;
            if(_loc1_.sectionNumber >= _loc1_.arrayTotalSectionDetails.length)
            {
               _loc1_.sectionNumber = _loc1_.arrayTotalSectionDetails.length - 1;
               newTempSpl = _loc1_.arrayTotalSectionDetails[_loc1_.sectionNumber].split("~");
               _loc1_.slideNumber = newTempSpl.length - 1;
               _loc1_.playSwfFileName = _loc1_.MainFilePath + newTempSpl[_loc1_.slideNumber];
               _loc2_.doCreateSlide();
               _loc2_.doPutBackAndFinished();
               _loc2_.loadSWFMovie();
            }
            else
            {
               newTempSpl = _loc1_.arrayTotalSectionDetails[_loc1_.sectionNumber].split("~");
               _loc1_.slideNumber = 2;
               _loc1_.playSwfFileName = _loc1_.MainFilePath + newTempSpl[_loc1_.slideNumber];
               _loc2_.doCreateSlide();
               _loc2_.doPutBackAndFinished();
               _loc2_.loadSWFMovie();
            }
         }
         else
         {
            newTempSpl = _loc1_.arrayTotalSectionDetails[_loc1_.sectionNumber].split("~");
            _loc1_.playSwfFileName = _loc1_.MainFilePath + newTempSpl[_loc1_.slideNumber];
            _loc2_.doPutBackAndFinished();
            _loc2_.loadSWFMovie();
         }
      }
   }
   else
   {
      _loc2_.doStopSpanishAudio();
      _loc1_.Play = true;
      _loc1_.Pause = false;
      _loc1_.CompClick = "";
      _loc1_.quizSection = false;
      _loc1_.needMoreBackURL = "";
      _loc1_.slideNumber = _loc1_.slideNumber + 1;
      _loc2_.animation_mc.unloadMovie();
      _loc2_.glossary.keyterms.mouse_down._x = _loc2_.glossary.keyterms.x_pos;
      _loc2_.glossary.keyterms.mouse_down._y = _loc2_.glossary.keyterms.y_pos;
      _loc2_.glossary._visible = false;
      _loc2_.calculator._visible = false;
      _loc2_.Mc_Formulas._visible = false;
      _loc2_.m_c._visible = false;
      _loc2_.popup.gotoAndStop(1);
      _loc2_.next.gotoAndStop("inactive");
      _loc2_.replay.gotoAndStop("inactive");
      newTempSpl = _loc1_.arrayTotalSectionDetails[_loc1_.sectionNumber].split("~");
      if(_loc1_.slideNumber > newTempSpl.length - 1)
      {
         _loc1_.sectionNumber = _loc1_.sectionNumber + 1;
         if(_loc1_.sectionNumber >= _loc1_.arrayTotalSectionDetails.length)
         {
            _loc1_.sectionNumber = _loc1_.arrayTotalSectionDetails.length - 1;
            newTempSpl = _loc1_.arrayTotalSectionDetails[_loc1_.sectionNumber].split("~");
            _loc1_.slideNumber = newTempSpl.length - 1;
            _loc1_.playSwfFileName = _loc1_.MainFilePath + newTempSpl[_loc1_.slideNumber];
            _loc2_.doCreateSlide();
            _loc2_.doPutBackAndFinished();
            _loc2_.loadSWFMovie();
         }
         else
         {
            newTempSpl = _loc1_.arrayTotalSectionDetails[_loc1_.sectionNumber].split("~");
            _loc1_.slideNumber = 2;
            _loc1_.playSwfFileName = _loc1_.MainFilePath + newTempSpl[_loc1_.slideNumber];
            _loc2_.doCreateSlide();
            _loc2_.doPutBackAndFinished();
            _loc2_.loadSWFMovie();
         }
      }
      else
      {
         newTempSpl = _loc1_.arrayTotalSectionDetails[_loc1_.sectionNumber].split("~");
         _loc1_.playSwfFileName = _loc1_.MainFilePath + newTempSpl[_loc1_.slideNumber];
         _loc2_.doPutBackAndFinished();
         _loc2_.loadSWFMovie();
      }
   }
}
function loadSWFMovie()
{
   var _loc1_ = _root;
   var _loc2_ = _global;
   _loc1_.Mc_Result._visible = false;
   _loc1_.Mc_Finish._visible = false;
   _loc1_.Mc_Finish.gotoAndStop(1);
   _loc1_.preLoading = false;
   _loc1_.SA._visible = false;
   _loc1_.EA._visible = false;
   _loc1_.SA_PLAY._visible = false;
   _loc1_.SA_PAUSE._visible = false;
   _loc2_.quizSection = false;
   _loc1_.doStopSpanishAudio();
   _loc2_.showLoading_Spanish = false;
   _loc2_.showWarnText = 1;
   _loc1_.animation_mc.unloadMovie();
   _loc1_.txtWarnText.text = "Loading page. Please wait...";
   _loc1_.txtWarnText._visible = true;
   ss = new Sound();
   ss.setVolume(_loc2_.VolLevel);
   _loc2_.startTime = getTimer();
   splitRootURL = _loc2_.playSwfFileName.split("/");
   splitFileName = splitRootURL[splitRootURL.length - 1].split("FQ");
   strTempLID = splitFileName[0];
   i = 0;
   while(i < splitRootURL.length)
   {
      if(splitRootURL.indexOf("FQ02") != -1)
      {
         strTempURL = splitRootURL(i);
      }
      i++;
   }
   if(_loc2_.playSwfFileName.indexOf("FQ01") != -1)
   {
      NavigationButtonsONOFF = _loc1_.SectionNavigationONOFF[0];
   }
   else if(_loc2_.playSwfFileName.indexOf("FQ02") != -1)
   {
      NavigationButtonsONOFF = _loc1_.SectionNavigationONOFF[1];
   }
   else if(_loc2_.playSwfFileName.indexOf("FQ03") != -1)
   {
      NavigationButtonsONOFF = _loc1_.SectionNavigationONOFF[2];
   }
   var _loc3_;
   if(NavigationButtonsONOFF.toUpperCase() == "OFF")
   {
      if(_loc1_.dtfCALCQUIZ.text.toLowerCase() == "on")
      {
         _loc1_.calculator_but._visible = true;
      }
      else
      {
         _loc1_.calculator_but._visible = false;
      }
      if(_loc1_.dtfFormulasInQuiz.text.toLowerCase() == "on")
      {
         _loc1_.Btn_Formulas._visible = true;
      }
      else
      {
         _loc1_.Btn_Formulas._visible = false;
      }
      if(_loc1_.dtfNotepadInQuiz.text.toLowerCase() == "on")
      {
         _loc1_.Btn_Notepad._visible = true;
      }
      else
      {
         _loc1_.Btn_Notepad._visible = false;
      }
      if(_loc1_.dtfWallInQuiz.text.toLowerCase() == "on")
      {
         _loc1_.Btn_Thewall._visible = true;
      }
      else
      {
         _loc1_.Btn_Thewall._visible = false;
      }
      var arrJSFSplFirst;
      var arrJSFSplSecond;
      var arrJSFSplThird;
      var strJSFVarFinalFirst;
      var strJSFVarFinalSecond;
      var strJSFVarFinalThird;
      _loc3_ = "";
      strJSFVarFinalFirst = "";
      strJSFVarFinalSecond = "";
      strJSFVarFinalThird = "";
      arrJSFSplFirst = _loc1_.XML_URL.split("HELP_COURSES/");
      arrJSFSplSecond = arrJSFSplFirst[1].split("/index");
      arrJSFSplThird = arrJSFSplSecond[0].split("/");
      i = 0;
      while(i < arrJSFSplThird.length)
      {
         if(_loc3_ == "")
         {
            _loc3_ = arrJSFSplThird[i];
         }
         else
         {
            _loc3_ = _loc3_ + "," + arrJSFSplThird[i];
         }
         i++;
      }
      strJSFVarFinalFirst = "HELP_COURSES," + _loc3_ + ",FQ," + strTempLID + "FQ01";
      strJSFVarFinalSecond = "HELP_COURSES," + _loc3_ + ",FQ," + strTempLID + "FQ02";
      strJSFVarFinalThird = "HELP_COURSES," + _loc3_ + ",FQ," + strTempLID + "FQ03";
      _loc1_[strJSFVarFinalFirst]._visible = false;
      _loc1_[strJSFVarFinalSecond]._visible = false;
      _loc1_[strJSFVarFinalThird]._visible = false;
      _loc1_.main_back._visible = false;
      _loc1_.map._visible = false;
      _loc1_.keyterms_but._visible = false;
      _loc1_.back_mc1._visible = false;
      _loc1_.next_mc._visible = false;
      _loc1_.BtnRewind._visible = false;
      _loc1_.BtnForward._visible = false;
      _loc1_.replay_mc._visible = false;
      _loc1_.audiomain._visible = false;
      _loc1_.pause_mc._visible = false;
      _loc1_.play_mc._visible = false;
      _loc1_.mySlider._visible = false;
      _loc1_.Progress_Bar._visible = false;
      _loc1_.FillColor._visible = false;
      _loc1_[strTempLID + "FQ01"]._visible = false;
      _loc1_[strTempLID + "FQ02"]._visible = false;
      _loc1_[strTempLID + "FQ03"]._visible = false;
   }
   else
   {
      if(_loc1_.dtfCALCLESSON.text.toLowerCase() == "on")
      {
         _loc1_.calculator_but._visible = true;
      }
      else
      {
         _loc1_.calculator_but._visible = false;
      }
      if(_loc1_.dtfFormulasInLesson.text.toLowerCase() == "off")
      {
         _loc1_.Btn_Formulas._visible = false;
      }
      else
      {
         _loc1_.Btn_Formulas._visible = true;
      }
      if(_loc1_.dtfNotepadInLesson.text.toLowerCase() == "off")
      {
         _loc1_.Btn_Notepad._visible = false;
      }
      else
      {
         _loc1_.Btn_Notepad._visible = true;
      }
      if(_loc1_.dtfWallInLesson.text.toLowerCase() == "off")
      {
         _loc1_.Btn_Thewall._visible = false;
      }
      else
      {
         _loc1_.Btn_Thewall._visible = true;
      }
      _loc1_.main_back._visible = true;
      _loc1_.map._visible = true;
      _loc1_.keyterms_but._visible = true;
      _loc1_.back_mc1._visible = true;
      _loc1_.next_mc._visible = true;
      _loc1_.BtnRewind._visible = true;
      _loc1_.BtnForward._visible = true;
      _loc1_.replay_mc._visible = true;
      _loc1_.audiomain._visible = true;
      _loc1_.pause_mc._visible = true;
      _loc1_.play_mc._visible = true;
      _loc1_.mySlider._visible = true;
      _loc1_.Progress_Bar._visible = true;
      _loc1_.FillColor._visible = true;
   }
   if(_loc1_.dtfNoMap.text.toUpperCase() == "YES")
   {
      _loc1_.map._visible = false;
   }
   if(_loc2_.playSwfFileName.indexOf("FQ02") != -1)
   {
      if(_loc1_.dtfKeyTermsTabInQuiz.text.toLowerCase() == "on")
      {
         _loc1_.keyterms_but._visible = true;
      }
      else
      {
         _loc1_.keyterms_but._visible = false;
      }
   }
   else if(_loc1_.dtfKeyTermsTabInLesson.text.toLowerCase() == "off")
   {
      _loc1_.keyterms_but._visible = false;
   }
   else
   {
      _loc1_.keyterms_but._visible = true;
   }
   _loc2_.gSound.stop();
   _loc1_.doCheckRndAudio();
   _loc1_.doCheckBGText();
   if(_loc2_.newTitleTag == true)
   {
      tempNewSpl = _loc1_.arraySectionDetails[_loc2_.sectionNumber].split("~");
      _loc2_.Section = tempNewSpl[tempNewSpl.length - 1];
   }
   else
   {
      i = 0;
      while(i < _loc1_.arrSectionReportVars.length)
      {
         if(_loc2_.sectionNumber == _loc1_.arrSectionReportVars[i].SectionNumber)
         {
            _loc2_.Section = _loc1_.arrSectionReportVars[i].SectionName;
            break;
         }
         i++;
      }
   }
   _loc2_.updatedata = 1;
   _loc2_.FileName = _loc2_.playSwfFileName;
   _loc2_.timeOutValue = parseInt(dtfFileDownload_TimeOut.text);
   _loc2_.triesValue = parseInt(dtfFileDownload_Tries.text);
   if(dtfFileDownload_TimeOut.text == "" || dtfFileDownload_TimeOut.text == "undefined" || dtfFileDownload_TimeOut.text == undefined)
   {
      _loc2_.timeOutValue = 10;
   }
   if(dtfFileDownload_Tries.text == "" || dtfFileDownload_Tries.text == "undefined" || dtfFileDownload_Tries.text == undefined)
   {
      _loc2_.triesValue = 5;
   }
   _loc2_.ErrorCode = "OK:";
   _loc1_.Mc_Data_Update.gotoAndStop(15);
   _loc1_.animation_mc.loadMovie(_loc2_.playSwfFileName,1);
   _loc1_.animation_mc_preload.unloadMovie();
   newTempSpl = _loc2_.arrayTotalSectionDetails[_loc2_.sectionNumber].split("~");
   if(_loc2_.slideNumber + 1 >= newTempSpl.length)
   {
      if(_loc2_.sectionNumber + 1 < _loc2_.arrayTotalSectionDetails.length)
      {
         newTempSpl = _loc2_.arrayTotalSectionDetails[_loc2_.sectionNumber + 1].split("~");
         _loc2_.playSwfFileName_Preload = _loc2_.MainFilePath + newTempSpl[2];
         _loc1_.chkSlideNumber = 2;
      }
   }
   else
   {
      _loc2_.playSwfFileName_Preload = _loc2_.MainFilePath + newTempSpl[_loc2_.slideNumber + 1];
      _loc1_.chkSlideNumber = _loc2_.slideNumber + 1;
   }
   if(_loc2_.playSwfFileName.indexOf("FQ01") != -1)
   {
      strFQIntroAudio = "FQ_Intro_" + (random(5) + 1);
      sndFQIntro = new Sound();
      sndFQIntro.attachSound(strFQIntroAudio);
      sndFQIntro.start();
      sndFQIntro.setVolume(_loc2_.VolLevel);
   }
   varTempTitleName = "";
   varTempTitleName = LessonName + ": ";
   switch(_loc2_.Section)
   {
      case "Introduction":
         varTempTitleName += "Introduction";
         break;
      case "Real World":
         varTempTitleName += "Real World Activity";
         break;
      case "Vocabulary":
         varTempTitleName += "Vocabulary";
         break;
      case "Instruction":
         varTempTitleName += "Instruction";
         break;
      case "Try It":
         varTempTitleName += "Try It";
         break;
      case "Games":
         varTempTitleName += "Game";
         break;
      case "Test and Skills":
         varTempTitleName += "Test Taking Skills";
         break;
      case "Final Quiz":
         varTempTitleName += "Final Quiz";
   }
   Mc_Page_Title.txtTitle.type = "dynamic";
   Mc_Page_Title.txtTitle.htmlText = "";
   if(_loc2_.Section != "Introduction" && _loc2_.playSwfFileName.indexOf("FQ01") <= 0)
   {
      varTempTitleName = varTempTitleName.split("amp;").join("");
      Mc_Page_Title.txtTitle.htmlText = varTempTitleName;
      Mc_Page_Title.txtTitle.type = "static";
      Mc_Page_Title.txtTitle.autoSize = true;
      if(Math.round(Mc_Page_Title.txtTitle._height) <= 40)
      {
         Mc_Page_Title._y = 76;
      }
      else
      {
         Mc_Page_Title._y = 64;
      }
   }
}
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
function showWrongFeed()
{
   intMc_Name = random(3);
   intMc_Name += 1;
   eval("_root.animation_mc.animation.Mc_Wrong_Feed" + intMc_Name)._visible = true;
   eval("_root.animation_mc.animation.Mc_Wrong_Feed" + intMc_Name).gotoAndPlay(2);
   eval("_root.animation_mc.animation.Mc_Wrong_Feed" + intMc_Name)._x = 5;
   _global.gSound.setVolume(_global.VolLevel);
}
function showRightFeed()
{
   intMc_Name = random(4);
   intMc_Name += 1;
   eval("_root.animation_mc.animation.Mc_Right_Feed" + intMc_Name)._visible = true;
   eval("_root.animation_mc.animation.Mc_Right_Feed" + intMc_Name).gotoAndPlay(2);
   eval("_root.animation_mc.animation.Mc_Right_Feed" + intMc_Name)._x = 5;
   _global.gSound.setVolume(_global.VolLevel);
}
function disableQuizButton()
{
   i = 1;
   while(i <= 25)
   {
      eval("_root.animation_mc.animation.AnsBtn" + i).enabled = false;
      eval("_root.animation_mc.animation.AnsBtn" + i)._visible = false;
      eval("_root.animation_mc.animation.AnsBtn" + i)._visible = false;
      i++;
   }
   _root.animation_mc.animation.NMHBtn.enabled = false;
}
function enableQuizButton()
{
   i = 1;
   while(i <= 25)
   {
      eval("_root.animation_mc.animation.AnsBtn" + i).enabled = true;
      eval("_root.animation_mc.animation.AnsBtn" + i)._visible = true;
      i++;
   }
   _root.animation_mc.animation.NMHBtn.enabled = true;
}
function doMapClickEnableAll()
{
   var _loc1_ = _global;
   _loc1_.Play = true;
   _loc1_.Pause = false;
   _loc1_.CompClick = "";
   _root.m1_l1.gotoAndStop("m1_l1_content");
   _root.m1_l1._visible = false;
   _loc1_.needMoreBackURL = "";
}
function doNeedMoreHelp(strScrName, framePlay, tempSection)
{
   var _loc1_ = _global;
   var _loc2_ = strScrName;
   _loc1_.quizSection = false;
   tempArrGetSwf = _loc1_.arrayTotalSectionDetails[_loc1_.sectionNumber].split("~");
   i = 2;
   while(i < tempArrGetSwf.length)
   {
      splTempChkName = tempArrGetSwf[i].substring(0,tempArrGetSwf[i].length - 4).split("/");
      mcName = splTempChkName[splTempChkName.length - 1];
      if(mcName == _loc2_)
      {
         _loc1_.slideNumber = i;
         _loc1_.playSwfFileName = _loc1_.MainFilePath + tempArrGetSwf[i];
      }
      i++;
   }
   _root.doCreateSlide();
   _root.loadSWFMovie();
}
function doCheckPrevAndNext()
{
   if(_root.dtfNMHLesson.text.toUpperCase() == "OFF")
   {
      _root.animation_mc.animation.NMHBtn._visible = false;
   }
   else
   {
      _root.animation_mc.animation.NMHBtn._visible = true;
   }
   splitRootURL = _global.playSwfFileName.split("/");
   splitFileName = splitRootURL[splitRootURL.length - 1].split("FQ");
   strTempLID = splitFileName[0];
   i = 0;
   while(i < splitRootURL.length)
   {
      if(splitRootURL.indexOf("FQ02") != -1)
      {
         strTempURL = splitRootURL(i);
      }
      i++;
   }
   if(_global.playSwfFileName.indexOf("FQ01") != -1)
   {
      NavigationButtonsONOFF = _root.SectionNavigationONOFF[0];
   }
   else if(_global.playSwfFileName.indexOf("FQ02") != -1)
   {
      NavigationButtonsONOFF = _root.SectionNavigationONOFF[1];
   }
   else if(_global.playSwfFileName.indexOf("FQ03") != -1)
   {
      NavigationButtonsONOFF = _root.SectionNavigationONOFF[2];
   }
   if(NavigationButtonsONOFF.toUpperCase() == "OFF")
   {
      _root[strTempLID + "FQ01"]._visible = false;
      _root[strTempLID + "FQ02"]._visible = false;
      _root[strTempLID + "FQ03"]._visible = false;
   }
   if(_global.playSwfFileName.indexOf("FQ02") == -1 && _global.playSwfFileName.indexOf("FQ03") == -1)
   {
      _root.doCheckSpanishAudio();
      if(_root.InternalPreloader._currentframe == 1 && _root.animation_mc.animation._currentframe > 1 && _root.animation_mc.animation._currentframe >= _root.animation_mc.animation._totalframes)
      {
         if(_root.nextani._currentframe == 1 && _root.next_mc._visible)
         {
            _root.nextani.gotoAndPlay("nextani");
         }
      }
      else
      {
         _root.nextani.gotoAndStop(1);
      }
      if(_root.animation_mc.animation._currentframe > 1 && _root.animation_mc.animation._currentframe >= _root.animation_mc.animation._totalframes)
      {
         _root.animation_mc.animation.stop();
         if(_global.randomAudio == true)
         {
            _global.gSound.setVolume(0);
         }
         _root.animation_mc.animation.s_aud1.gotoAndStop(1);
         _root.pause_mc._visible = false;
         _root.play_mc._visible = false;
         if(_global.Play == true && _global.CompClick == "")
         {
            _root.m_c._visible = false;
            _root.glossary._visible = false;
            _root.calculator._visible = false;
            _root.Mc_Formulas._visible = false;
            _root.m1_l1.gotoAndStop("m1_l1_content");
            _root.m1_l1._visible = false;
         }
      }
      else if(_root.animation_mc.animation._currentframe >= 1 && _root.animation_mc.animation._currentframe < _root.animation_mc.animation._totalframes)
      {
         if(_global.needMoreBackURL != "")
         {
            _root.animation_mc.animation.TestBack._alpha = 100;
            _root.animation_mc.animation.TestBack._visible = true;
         }
         else
         {
            _root.animation_mc.animation.TestBack._alpha = 0;
            _root.animation_mc.animation.TestBack._visible = false;
         }
         _root.nextani.gotoAndStop(1);
         if(_global.Play == true && _global.CompClick == "" && _global.quizSection == false)
         {
            _root.mover_mc.gotoAndStop("inactive");
            _root.nextani.gotoAndStop(1);
            _root.glossary._visible = false;
            _root.m_c._visible = false;
            _root.calculator._visible = false;
            _root.Mc_Formulas._visible = false;
            _root.m1_l1.gotoAndStop("m1_l1_content");
            _root.m1_l1._visible = false;
            _root.replay_mc.gotoAndStop("inactive");
            if(_global.playSwfFileName.indexOf("FQ") == -1)
            {
               _root.pause_mc._visible = true;
               _root.play_mc._visible = false;
            }
            if(_root.animation_mc.animation._currentframe == _global.CurPlayFrame)
            {
               _root.animation_mc.animation.play();
            }
            _root.animation_mc.animation.s_aud1.gotoAndStop(1);
            i = 1;
            while(i <= 4)
            {
               eval("_root.animation_mc.animation.Mc_Feed" + i).gotoAndStop(1);
               eval("_root.animation_mc.animation.Mc_Feed" + i)._visible = false;
               eval("_root.animation_mc.animation.Mc_Right_Feed" + i).gotoAndStop(1);
               eval("_root.animation_mc.animation.Mc_Right_Feed" + i)._visible = false;
               eval("_root.animation_mc.animation.Mc_Wrong_Feed" + i).gotoAndStop(1);
               eval("_root.animation_mc.animation.Mc_Wrong_Feed" + i)._visible = false;
               i++;
            }
         }
         else
         {
            if(_global.playSwfFileName.indexOf("FQ") == -1)
            {
               _root.pause_mc._visible = false;
               _root.play_mc._visible = true;
            }
            _root.animation_mc.animation.stop();
            _root.animation_mc.animation.s_aud1.gotoAndStop(1);
            _global.CurPlayFrame = _root.animation_mc.animation._currentframe;
            if(_global.randomAudio == true)
            {
               _global.gSound.setVolume(0);
            }
         }
         if(_global.Mute == false)
         {
            _global.gSound.setVolume(_global.volLevel);
            _global.spanSoundMp3.setVolume(_global.volLevel);
         }
         else
         {
            _global.gSound.setVolume(0);
            _global.spanSoundMp3.setVolume(0);
         }
      }
   }
   else
   {
      _root.nextani.gotoAndStop(1);
   }
   if(_global.playSwfFileName.indexOf("FQ02") != -1)
   {
      if(_root.dtfKeyTermsTabInQuiz.text.toLowerCase() == "on")
      {
         _root.keyterms_but._visible = true;
      }
      else
      {
         _root.keyterms_but._visible = false;
      }
   }
   else if(_root.dtfKeyTermsTabInLesson.text.toLowerCase() == "off")
   {
      _root.keyterms_but._visible = false;
   }
   else
   {
      _root.keyterms_but._visible = true;
   }
}
function doCheckRndAudio()
{
   var _loc1_ = _global;
   splTempChkName_1 = _loc1_.playSwfFileName.split("/");
   flgExists = false;
   i = 0;
   while(i < _loc1_.arrayTotalRndAudioDetails.length)
   {
      newTempSpl = _loc1_.arrayTotalRndAudioDetails[i].split("~");
      j = 2;
      while(j < newTempSpl.length)
      {
         splTempChkName_2 = newTempSpl[j].split("/");
         if(splTempChkName_1[splTempChkName_1.length - 1] == splTempChkName_2[splTempChkName_2.length - 1])
         {
            flgExists = true;
         }
         j++;
      }
      i++;
   }
   if(flgExists)
   {
      _loc1_.rndAud = random(3) + 1;
      _loc1_.rndAudLabel = "S" + _loc1_.rndAud;
      _root.Mc_Random_Audio.gotoAndPlay(_loc1_.rndAudLabel);
      _loc1_.gSound = new Sound();
      _loc1_.gSound.attachSound(_loc1_.rndAudLabel);
      _loc1_.gSound.start();
      _loc1_.gSound.setVolume(_loc1_.VolLevel);
      _loc1_.randomAudio = true;
   }
   else
   {
      _loc1_.randomAudio = false;
      _root.s_aud1.gotoAndStop(1);
   }
}
function doCheckBGText()
{
   var _loc1_ = _global;
   splTempChkName_1 = _loc1_.playSwfFileName.split("/");
   flgExists = false;
   i = 0;
   while(i < _loc1_.arrayTotalBgTextDetails.length)
   {
      newTempSpl = _loc1_.arrayTotalBgTextDetails[i].split("~");
      j = 2;
      while(j < newTempSpl.length)
      {
         splTempChkName_2 = newTempSpl[j].split("/");
         if(splTempChkName_1[splTempChkName_1.length - 1] == splTempChkName_2[splTempChkName_2.length - 1])
         {
            flgExists = true;
         }
         j++;
      }
      i++;
   }
   if(flgExists)
   {
      _root.Mc_BackText._visible = true;
   }
   else
   {
      _root.Mc_BackText._visible = false;
   }
}
function doForAndRew()
{
   var _loc1_ = _root;
   var _loc2_ = _global;
   if(_loc1_.animation_mc.animation.start == true && _loc2_.forward == 1)
   {
      _loc1_.animation_mc.animation.val = _loc1_.animation_mc.animation._currentframe;
      _loc1_.animation_mc.animation.val += 20;
      if(_loc1_.animation_mc.animation.val >= _loc1_.animation_mc.animation._totalframes)
      {
         _loc1_.doPlayNextMovie();
      }
      else
      {
         _loc1_.animation_mc.animation.gotoAndStop(_loc1_.animation_mc.animation.val);
         if(_loc2_.quizSection == false)
         {
            _loc1_.animation_mc.animation.play();
         }
      }
   }
   else if(_loc1_.animation_mc.animation.start == true && _loc2_.rewind == 1)
   {
      _loc1_.animation_mc.animation.val = _loc1_.animation_mc.animation._currentframe;
      _loc1_.animation_mc.animation.val -= 20;
      if(_loc1_.animation_mc.animation.val <= 1)
      {
         _loc1_.doPlayPreviousMovie();
      }
      else
      {
         _loc1_.animation_mc.animation.gotoAndStop(_loc1_.animation_mc.animation.val);
         if(_loc2_.quizSection == false)
         {
            _loc1_.animation_mc.animation.play();
         }
      }
   }
}
function doPutBackAndFinished()
{
   var _loc2_ = _global;
   var _loc3_;
   _loc3_ = false;
   var _loc1_;
   _loc1_ = _loc2_.playSwfFileName.substring(0,_loc2_.playSwfFileName.length - 4).split("/");
   i = 0;
   while(i < _loc2_.arrFinishSlide.length)
   {
      if(_loc2_.arrFinishSlide[i] == _loc1_[_loc1_.length - 5] + "," + _loc1_[_loc1_.length - 4] + "," + _loc1_[_loc1_.length - 3] + "," + _loc1_[_loc1_.length - 2] + "," + _loc1_[_loc1_.length - 1])
      {
         _loc3_ = true;
      }
      i++;
   }
   if(_loc3_ == false)
   {
      _loc2_.arrFinishSlide.push(_loc1_[_loc1_.length - 5] + "," + _loc1_[_loc1_.length - 4] + "," + _loc1_[_loc1_.length - 3] + "," + _loc1_[_loc1_.length - 2] + "," + _loc1_[_loc1_.length - 1]);
   }
   if(_loc2_.arrGoBack[_loc2_.arrGoBack.length - 1] != _loc1_[_loc1_.length - 5] + "," + _loc1_[_loc1_.length - 4] + "," + _loc1_[_loc1_.length - 3] + "," + _loc1_[_loc1_.length - 2] + "," + _loc1_[_loc1_.length - 1])
   {
      _loc2_.arrGoBack.push(_loc1_[_loc1_.length - 5] + "," + _loc1_[_loc1_.length - 4] + "," + _loc1_[_loc1_.length - 3] + "," + _loc1_[_loc1_.length - 2] + "," + _loc1_[_loc1_.length - 1]);
   }
}
function DoHyperLinks()
{
   var _loc1_ = _root;
   var _loc2_ = _global;
   if(_loc1_.dtfKTLesson.text.toUpperCase() != "OFF")
   {
      _loc2_.engKTSoundMp3.stop();
      _loc1_.m_c.McKTEAudio.gotoAndStop(1);
      _loc1_.m_c.McKTSAudio.gotoAndStop(1);
      _loc2_.CompClick = "HyperLink";
      _loc2_.Pause = true;
      _loc2_.Play = false;
      _loc1_.popup.gotoAndStop(1);
      _loc1_.mover_mc.gotoAndStop("inactive");
      _loc1_.nextani.gotoAndStop(1);
      _loc1_.navi.enabled = false;
      _loc1_.glossary._visible = false;
      _loc1_.m1_l1._visible = false;
      _loc1_.calculator._visible = false;
      _loc1_.Mc_Formulas._visible = false;
      _loc1_.ct_center.gotoAndStop(2);
      _loc1_.m_c.gotoAndStop(6);
      _loc1_.m_c._visible = true;
      _loc2_.KeyAttribute += "~English";
      _loc2_.openScrKey = true;
      _loc1_.m_c.doGetSubLink(_loc2_.KeyAttribute);
   }
}
function doGetSwfFileName(mcClipName, tempSection)
{
   var _loc1_ = _global;
   var _loc2_ = mcClipName;
   _loc1_.sectionNumber = tempSection - 1;
   tempArrGetSwf = _loc1_.arrayTotalSectionDetails[_loc1_.sectionNumber].split("~");
   i = 2;
   while(i < tempArrGetSwf.length)
   {
      splTempChkName = tempArrGetSwf[i].substring(0,tempArrGetSwf[i].length - 4).split("/");
      mcName = splTempChkName[splTempChkName.length - 1];
      if(mcName == _loc2_)
      {
         _loc1_.slideNumber = i;
         _loc1_.playSwfFileName = _loc1_.MainFilePath + tempArrGetSwf[i];
      }
      i++;
   }
}
function doGetSQSwfFileName(mcClipName)
{
   var _loc1_ = _global;
   var _loc2_ = mcClipName;
   tempArrGetSwf = _loc1_.arrayTotalSectionDetails[_loc1_.sectionNumber].split("~");
   i = 2;
   while(i < tempArrGetSwf.length)
   {
      splTempChkName = tempArrGetSwf[i].substring(0,tempArrGetSwf[i].length - 4).split("/");
      tempMcName = "";
      j = 0;
      while(j < splTempChkName.length)
      {
         if(tempMcName == "")
         {
            tempMcName = splTempChkName[j];
         }
         else
         {
            tempMcName = tempMcName + "," + splTempChkName[j];
         }
         j++;
      }
      mcName = tempMcName;
      if(mcName == _loc2_)
      {
         _loc1_.slideNumber = i;
         _loc1_.playSwfFileName = _loc1_.MainFilePath + tempArrGetSwf[i];
      }
      i++;
   }
}
function doPlaySpanishAudio()
{
   if(_global.newTitleTag == true)
   {
      if(_global.sectionNumber >= 0 && _global.sectionNumber < _global.arrayTotalSectionDetails.length)
      {
         _global.Pause = true;
         _global.Play = false;
         _root.animation_mc.animation.stop();
         _root.animation_mc.animation.Mc_Feed1.stop();
         _root.animation_mc.animation.Mc_Feed2.stop();
         _root.animation_mc.animation.Mc_Feed3.stop();
         _root.animation_mc.animation.Mc_Feed4.stop();
         _root.pause_mc._visible = false;
         _root.play_mc._visible = true;
         _root.glossary._visible = false;
         _root.calculator._visible = false;
         _root.Mc_Formulas._visible = false;
         _root.m_c._visible = false;
         _global.showLoading_Spanish = true;
         _root.SA._visible = false;
         _root.SA_PLAY._alpha = 100;
         _root.SA_PAUSE._alpha = 100;
         _root.SA_PLAY._visible = false;
         _root.SA_PAUSE._visible = true;
         _root.EA._visible = true;
         _global.spanSound = true;
         SFTemFName = _global.playSwfFileName.split("/");
         SSTemFName = SFTemFName[SFTemFName.length - 1].split(".");
         _root.animation_mc.animation.stop();
         spanishAudioURL = "";
         i = 0;
         while(i < SFTemFName.length - 2)
         {
            if(spanishAudioURL == "")
            {
               spanishAudioURL = SFTemFName[i];
            }
            else
            {
               spanishAudioURL = spanishAudioURL + "/" + SFTemFName[i];
            }
            i++;
         }
         SndFName = spanishAudioURL + "/SA/" + SSTemFName[0] + ".mp3";
         _global.spanSoundMp3 = new Sound();
         _global.spanSoundMp3.onLoad = function(success)
         {
            if(success)
            {
               if(_global.showLoading_Spanish)
               {
                  _global.spanSoundMp3.start(0);
               }
            }
         };
         i = 1;
         while(i <= 4)
         {
            eval("_root.animation_mc.animation.Mc_Feed" + i).gotoAndStop(1);
            eval("_root.animation_mc.animation.Mc_Right_Feed" + i).gotoAndStop(1);
            eval("_root.animation_mc.animation.Mc_Wrong_Feed" + i).gotoAndStop(1);
            i++;
         }
         _root.animation_mc.animation.Feed_Right.gotoAndStop(1);
         _root.animation_mc.animation.Feed_Wrong.gotoAndStop(1);
         _global.spanSoundMp3.loadSound(SndFName,false);
         _global.spanSoundMp3.onSoundComplete = function()
         {
            _global.spanSoundMp3.stop();
            _global.spanSoundMp3.unLoad();
            _root.doStopSpanishAudio();
         };
      }
   }
   else if(_global.sectionNumber >= 1 && _global.sectionNumber < _global.arrayTotalSectionDetails.length)
   {
      _global.Pause = true;
      _global.Play = false;
      _root.animation_mc.animation.stop();
      _root.animation_mc.animation.Mc_Feed1.stop();
      _root.animation_mc.animation.Mc_Feed2.stop();
      _root.animation_mc.animation.Mc_Feed3.stop();
      _root.animation_mc.animation.Mc_Feed4.stop();
      _root.pause_mc._visible = false;
      _root.play_mc._visible = true;
      _root.glossary._visible = false;
      _root.calculator._visible = false;
      _root.Mc_Formulas._visible = false;
      _root.m_c._visible = false;
      _global.showLoading_Spanish = true;
      _root.SA._visible = false;
      _root.SA_PLAY._alpha = 100;
      _root.SA_PAUSE._alpha = 100;
      _root.SA_PLAY._visible = false;
      _root.SA_PAUSE._visible = true;
      _root.EA._visible = true;
      _global.spanSound = true;
      SFTemFName = _global.playSwfFileName.split("/");
      SSTemFName = SFTemFName[SFTemFName.length - 1].split(".");
      _root.animation_mc.animation.stop();
      spanishAudioURL = "";
      i = 0;
      while(i < SFTemFName.length - 2)
      {
         if(spanishAudioURL == "")
         {
            spanishAudioURL = SFTemFName[i];
         }
         else
         {
            spanishAudioURL = spanishAudioURL + "/" + SFTemFName[i];
         }
         i++;
      }
      SndFName = spanishAudioURL + "/SA/" + SSTemFName[0] + ".mp3";
      _global.spanSoundMp3 = new Sound();
      _global.spanSoundMp3.onLoad = function(success)
      {
         if(success)
         {
            if(_global.showLoading_Spanish)
            {
               _global.spanSoundMp3.start(0);
            }
         }
      };
      i = 1;
      while(i <= 4)
      {
         eval("_root.animation_mc.animation.Mc_Feed" + i).gotoAndStop(1);
         eval("_root.animation_mc.animation.Mc_Right_Feed" + i).gotoAndStop(1);
         eval("_root.animation_mc.animation.Mc_Wrong_Feed" + i).gotoAndStop(1);
         i++;
      }
      _root.animation_mc.animation.Feed_Right.gotoAndStop(1);
      _root.animation_mc.animation.Feed_Wrong.gotoAndStop(1);
      _global.spanSoundMp3.loadSound(SndFName,false);
      _global.spanSoundMp3.onSoundComplete = function()
      {
         _global.spanSoundMp3.stop();
         _global.spanSoundMp3.unLoad();
         _root.doStopSpanishAudio();
      };
   }
}
function doStopSpanishAudio()
{
   var _loc1_ = _root;
   var _loc2_ = _global;
   _loc2_.spanSoundMp3.stop();
   _loc2_.spanSoundMp3.unload();
   if(_loc1_.animation_mc.animation._currentframe != _loc1_.animation_mc.animation._totalframes && _loc2_.quizSection == false)
   {
      _loc1_.animation_mc.animation.play();
   }
   _loc2_.Play = true;
   _loc2_.Pause = false;
   _loc1_.SA._visible = true;
   _loc1_.EA._visible = false;
   _loc2_.spanSound = false;
   if(_loc1_.animation_mc.animation.Mc_Feed1._currentframe > 1)
   {
      _loc1_.animation_mc.animation.Mc_Feed1.play();
   }
   if(_loc1_.animation_mc.animation.Mc_Feed2._currentframe > 1)
   {
      _loc1_.animation_mc.animation.Mc_Feed2.play();
   }
   if(_loc1_.animation_mc.animation.Mc_Feed3._currentframe > 1)
   {
      _loc1_.animation_mc.animation.Mc_Feed3.play();
   }
   if(_loc1_.animation_mc.animation.Mc_Feed4._currentframe > 1)
   {
      _loc1_.animation_mc.animation.Mc_Feed4.play();
   }
   _loc1_.pause_mc._visible = true;
   _loc1_.play_mc._visible = false;
   _loc1_.glossary._visible = false;
   _loc1_.calculator._visible = false;
   _loc1_.Mc_Formulas._visible = false;
   _loc1_.m_c._visible = false;
   _loc2_.showLoading_Spanish = false;
   _loc1_.SA._visible = true;
   _loc1_.EA._visible = false;
   _loc2_.spanSound = false;
   _loc1_.SA_PLAY._visible = false;
   _loc1_.SA_PAUSE._visible = false;
}
function doCreateGlossaryWord(M_Name)
{
   var _loc1_ = _global;
   var _loc2_ = _root;
   _loc1_.engKTSoundMp3.stop();
   _loc2_.glossary.keyterms.McKTEAudio.gotoAndStop(1);
   _loc2_.glossary.keyterms.McKTSAudio.gotoAndStop(1);
   _loc1_.btnKeyTermsPressed = undefined;
   _loc1_.arrTempKeyTerm = new Array();
   M_Name += "_";
   _loc2_.glossary.keyterms.BtnBack._visible = false;
   F_X = new XML();
   _loc2_.QU = _loc1_.KeyTermVar;
   F_X.load(_loc1_.KeyTermVar);
   F_X.ignoreWhite = true;
   F_X.onLoad = function()
   {
      var _loc1_ = _global;
      var _loc2_ = _root;
      T_L = F_X.firstChild.childNodes.length;
      S_X = F_X.firstChild;
      _loc2_.glossary.keyterms.McKTWordList.removeAll();
      _loc2_.glossary.keyterms.McKTWordList.scrollBar_mc.scrollPosition = 0;
      i = 0;
      while(i < T_L)
      {
         S_L = S_X.childNodes[i].nodeName;
         splLng = S_L.split("~LNG~");
         lngEng = splLng[0];
         lngSpan = splLng[1];
         if(lngEng.indexOf("~") != -1)
         {
            tempSpl = lngEng.split("~");
            newTempSpl = "";
            k = 0;
            while(k <= tempSpl.length - 1)
            {
               if(newTempSpl == "")
               {
                  newTempSpl = tempSpl[k];
               }
               else
               {
                  newTempSpl = newTempSpl + " " + tempSpl[k];
               }
               k++;
            }
            lngEng = newTempSpl;
         }
         if(lngSpan.indexOf("~") != -1)
         {
            tempSpl = lngSpan.split("~");
            newTempSpl = "";
            k = 0;
            while(k <= tempSpl.length - 1)
            {
               if(newTempSpl == "")
               {
                  newTempSpl = tempSpl[k];
               }
               else
               {
                  newTempSpl = newTempSpl + " " + tempSpl[k];
               }
               k++;
            }
            lngSpan = newTempSpl;
         }
         S_T = S_X.childNodes[i].firstChild;
         tempArrStoreValue = M_Name add i;
         _loc1_.arrTempKeyTerm.push(tempArrStoreValue);
         if(_loc1_.LngFlag == "English")
         {
            _loc2_.glossary.keyterms.McKTWordList.addItem(lngEng,tempArrStoreValue);
         }
         else
         {
            _loc2_.glossary.keyterms.McKTWordList.addItem(lngSpan,tempArrStoreValue);
         }
         tempKeyTermValue = M_Name add i + "SPLDATA" + lngEng + "SPLDATA" + lngSpan + "SPLDATA" + S_T + "SPLDATA" + S_X.childNodes[i].attributes.SubLinkEng + "SPLDATA" + S_X.childNodes[i].attributes.SubLinkSpan + "SPLDATA" + S_X.childNodes[i].attributes.ExFileName + "SPLDATA" + S_X.childNodes[i].attributes.ScreenKeyTerm;
         _loc1_.arrKeyTermBank[i] = tempKeyTermValue;
         i++;
      }
   };
   _loc2_.doVisibleKeyAlphBut();
   _loc2_.glossary.keyterms.mouse_down._x = _loc2_.glossary.keyterms.x_pos;
   _loc2_.glossary.keyterms.mouse_down._y = _loc2_.glossary.keyterms.y_pos;
}
function doCreateGlossAlph(M_Name, Word)
{
   var _loc1_ = _global;
   var _loc2_ = _root;
   _loc1_.engKTSoundMp3.stop();
   _loc2_.glossary.keyterms.McKTEAudio.gotoAndStop(1);
   _loc2_.glossary.keyterms.McKTSAudio.gotoAndStop(1);
   _loc1_.arrTempKeyTerm = new Array();
   M_Name += "_";
   _loc2_.glossary.keyterms.BtnBack._visible = false;
   F_W = Word;
   F_X = new XML();
   F_X.load(_loc1_.KeyTermVar);
   F_X.ignoreWhite = true;
   F_X.onLoad = function()
   {
      var _loc1_ = _global;
      var _loc2_ = _root;
      T_L = F_X.firstChild.childNodes.length;
      S_X = F_X.firstChild;
      _loc2_.glossary.keyterms.McKTWordList.removeAll();
      _loc2_.glossary.keyterms.McKTWordList.scrollBar_mc.scrollPosition = 0;
      i = 0;
      while(i < T_L)
      {
         if(_loc1_.LngFlag == "English")
         {
            C_N = S_X.childNodes[i].attributes.EngCategory;
         }
         else
         {
            C_N = S_X.childNodes[i].attributes.SpanCategory;
         }
         if(C_N.toLowerCase() == F_W.toLowerCase())
         {
            S_L = S_X.childNodes[i].nodeName;
            splLng = S_L.split("~LNG~");
            lngEng = splLng[0];
            lngSpan = splLng[1];
            if(lngEng.indexOf("~") != -1)
            {
               tempSpl = lngEng.split("~");
               newTempSpl = "";
               k = 0;
               while(k <= tempSpl.length - 1)
               {
                  if(newTempSpl == "")
                  {
                     newTempSpl = tempSpl[k];
                  }
                  else
                  {
                     newTempSpl = newTempSpl + " " + tempSpl[k];
                  }
                  k++;
               }
               lngEng = newTempSpl;
            }
            if(lngSpan.indexOf("~") != -1)
            {
               tempSpl = lngSpan.split("~");
               newTempSpl = "";
               k = 0;
               while(k <= tempSpl.length - 1)
               {
                  if(newTempSpl == "")
                  {
                     newTempSpl = tempSpl[k];
                  }
                  else
                  {
                     newTempSpl = newTempSpl + " " + tempSpl[k];
                  }
                  k++;
               }
               lngSpan = newTempSpl;
            }
            S_T = S_X.childNodes[i].firstChild;
            tempArrStoreValue = M_Name add i;
            _loc1_.arrTempKeyTerm.push(tempArrStoreValue);
            if(_loc1_.LngFlag == "English")
            {
               _loc2_.glossary.keyterms.McKTWordList.addItem(lngEng,tempArrStoreValue);
            }
            else
            {
               _loc2_.glossary.keyterms.McKTWordList.addItem(lngSpan,tempArrStoreValue);
            }
         }
         i++;
      }
   };
   _loc2_.glossary.keyterms.keyterm_diagram.unloadMovie();
}
function doDisplayGlossDescription(tempRefValue)
{
   var _loc1_ = _root;
   var _loc2_ = _global;
   _loc1_.glossary.keyterms.McKTWordList._visible = false;
   _loc2_.engKTSoundMp3.stop();
   _loc1_.glossary.keyterms.gotoAndStop(2);
   _loc1_.glossary.keyterms.McKTEAudio.gotoAndStop(1);
   _loc1_.glossary.keyterms.McKTSAudio.gotoAndStop(1);
   _loc1_.glossary.keyterms.BtnBack._visible = false;
   splTemp = tempRefValue.split("_");
   tempKeyTerm = _loc2_.arrKeyTermBank[parseFloat(splTemp[1])];
   splKeyTerm = tempKeyTerm.split("SPLDATA");
   _loc1_.glossary.keyterms.title = splKeyTerm[1];
   _loc1_.glossary.keyterms.spanish_title = splKeyTerm[2];
   splKeyTermDesc = splKeyTerm[3].split("~LNG~");
   tempDescription = splKeyTermDesc[0];
   tempSubLink = splKeyTerm[4];
   if(tempSubLink != "" && tempSubLink != undefined && tempSubLink != "undefined")
   {
      splTempSubLink = new Array();
      splTempSubLink = tempSubLink.split("~");
      i = 0;
      while(i < splTempSubLink.length)
      {
         splTempLinkWord = splTempSubLink[i].split(",");
         splTempDesc = tempDescription.split(splTempLinkWord[0]);
         tempLinkVal = "";
         j = 0;
         while(j < splTempDesc.length)
         {
            if(j == 0)
            {
               if(splTempDesc[j] == "")
               {
                  tempLinkVal = "<A HREF=\'asfunction:doGetSubLink," + splTempLinkWord[1] + "~English\'><FONT COLOR=\'#006600\'><U><B>" + splTempLinkWord[0] + "</B></U></FONT></A>";
               }
               else
               {
                  tempLinkVal = splTempDesc[j];
               }
            }
            else if(j == 1)
            {
               if(splTempDesc[j - 1] == "")
               {
                  tempLinkVal += splTempDesc[j];
               }
               else
               {
                  tempLinkVal = tempLinkVal + "<A HREF=\'asfunction:doGetSubLink," + splTempLinkWord[1] + "~English\'><FONT COLOR=\'#006600\'><U><B>" + splTempLinkWord[0] + "</B></U></FONT></A>" + splTempDesc[j];
               }
            }
            else
            {
               tempLinkVal = tempLinkVal + splTempLinkWord[0] + splTempDesc[j];
            }
            j++;
         }
         tempDescription = tempLinkVal;
         i++;
      }
      splTempSpace = tempDescription.split("</A> <A");
      tempFinalKTDef = "";
      i = 0;
      while(i < splTempSpace.length)
      {
         if(tempFinalKTDef == "")
         {
            tempFinalKTDef = splTempSpace[i];
         }
         else
         {
            tempFinalKTDef = tempFinalKTDef + "</A>&nbsp;<A" + splTempSpace[i];
         }
         i++;
      }
      _loc1_.glossary.keyterms.DesEng.htmlText = tempFinalKTDef;
   }
   else
   {
      _loc1_.glossary.keyterms.DesEng.htmlText = tempDescription;
   }
   tempDescription = splKeyTermDesc[1];
   tempSubLink = splKeyTerm[5];
   if(tempSubLink != "" && tempSubLink != undefined && tempSubLink != "undefined")
   {
      splTempSubLink = new Array();
      splTempSubLink = tempSubLink.split("~");
      i = 0;
      while(i < splTempSubLink.length)
      {
         splTempLinkWord = splTempSubLink[i].split(",");
         splTempDesc = tempDescription.split(splTempLinkWord[0]);
         tempLinkVal = "";
         j = 0;
         while(j < splTempDesc.length)
         {
            if(j == 0)
            {
               if(splTempDesc[j] == "")
               {
                  tempLinkVal = "<A HREF=\'asfunction:doGetSubLink," + splTempLinkWord[1] + "~Spanish\'><FONT COLOR=\'#006600\'><U><B>" + splTempLinkWord[0] + "</B></U></FONT></A>";
               }
               else
               {
                  tempLinkVal = splTempDesc[j];
               }
            }
            else if(j == 1)
            {
               if(splTempDesc[j - 1] == "")
               {
                  tempLinkVal += splTempDesc[j];
               }
               else
               {
                  tempLinkVal = tempLinkVal + "<A HREF=\'asfunction:doGetSubLink," + splTempLinkWord[1] + "~Spanish\'><FONT COLOR=\'#006600\'><U><B>" + splTempLinkWord[0] + "</B></U></FONT></A>" + splTempDesc[j];
               }
            }
            else
            {
               tempLinkVal = tempLinkVal + splTempLinkWord[0] + splTempDesc[j];
            }
            j++;
         }
         tempDescription = tempLinkVal;
         i++;
      }
      splTempSpace = tempDescription.split("</A> <A");
      tempFinalKTDef = "";
      i = 0;
      while(i < splTempSpace.length)
      {
         if(tempFinalKTDef == "")
         {
            tempFinalKTDef = splTempSpace[i];
         }
         else
         {
            tempFinalKTDef = tempFinalKTDef + "</A>&nbsp;<A" + splTempSpace[i];
         }
         i++;
      }
      _loc1_.glossary.keyterms.DesSpan.htmlText = tempFinalKTDef;
   }
   else
   {
      _loc1_.glossary.keyterms.DesSpan.htmlText = tempDescription;
   }
   exampleSwfFileName = _loc2_.xmlPath + "DIG/" + splKeyTerm[6].toLowerCase();
   _loc1_.glossary.keyterms.keyterm_diagram.unloadMovie();
   _loc1_.glossary.keyterms.keyterm_diagram.loadMovie(exampleSwfFileName,7);
   tempSplSndKTFName = splKeyTerm[6].toLowerCase().split(".");
   SndKTEFName = _loc2_.xmlPath + "EAD/" + tempSplSndKTFName[0] + ".mp3";
   SndKTSFName = _loc2_.xmlPath + "SAD/" + tempSplSndKTFName[0] + ".mp3";
   if(_loc2_.LngFlag == "English")
   {
      _loc2_.backLinkWord = splKeyTerm[1] + "~English";
   }
   else
   {
      _loc2_.backLinkWord = splKeyTerm[2] + "~Spanish";
   }
   if(_loc1_.dtfClicks.text.toUpperCase() == "ON")
   {
      _loc1_.strIndexGlobalButttonClickType = "KTDICT";
      if(_loc2_.LngFlag.toUpperCase() == "ENGLISH")
      {
         strTempIndexGlobalClickDesc = _loc1_.glossary.keyterms.TitleEng.text;
      }
      else
      {
         strTempIndexGlobalClickDesc = _loc1_.glossary.keyterms.TitleSpan.text;
      }
      strTempIndexGlobalClickDesc = strTempIndexGlobalClickDesc.split("&").join("ANDSYM");
      _loc1_.strIndexGlobalClickDesc = strTempIndexGlobalClickDesc;
      _loc1_.strFinalClickURL = "";
      _loc1_.Send_Click_Report_Mc.gotoAndPlay(2);
   }
}
function doCreateSubLink(subLinkWord)
{
   var _loc1_ = subLinkWord;
   var _loc2_ = _global;
   var _loc3_ = _root;
   _loc2_.engKTSoundMp3.stop();
   _loc3_.glossary.keyterms.McKTEAudio.gotoAndStop(1);
   _loc3_.glossary.keyterms.McKTSAudio.gotoAndStop(1);
   _loc3_.glossary.keyterms.BtnBack._visible = true;
   splSubLinkWord = _loc1_.split("~");
   tempInt = -1;
   chkSubInt = 0;
   i = 0;
   while(i < _loc2_.arrKeyTermBank.length)
   {
      splKeyTerm = _loc2_.arrKeyTermBank[i].split("SPLDATA");
      if(splSubLinkWord[1] == "English")
      {
         tempLangChkWord = splKeyTerm[1];
      }
      else
      {
         tempLangChkWord = splKeyTerm[2];
      }
      if(splKeyTerm[1].toLowerCase() == splSubLinkWord[0].toLowerCase())
      {
         tempLangChkWord = splKeyTerm[1];
      }
      else if(splKeyTerm[2].toLowerCase() == splSubLinkWord[0].toLowerCase())
      {
         tempLangChkWord = splKeyTerm[2];
      }
      tempSubLinkWord = splSubLinkWord[0];
      if(tempSubLinkWord.indexOf("_") == -1)
      {
         _loc1_ = splSubLinkWord[0];
         if(tempLangChkWord.toLowerCase() == _loc1_.toLowerCase())
         {
            chkSubInt++;
            if(chkSubInt == 1)
            {
               tempInt = i;
            }
         }
      }
      else
      {
         tempSplSubLinkWord = tempSubLinkWord.split("_");
         _loc1_ = tempSplSubLinkWord[0];
         if(tempLangChkWord.toLowerCase() == _loc1_.toLowerCase())
         {
            chkSubInt++;
            if(Number(tempSplSubLinkWord[1]) == chkSubInt)
            {
               tempInt = i;
            }
         }
      }
      i++;
   }
   splKeyTerm = _loc2_.arrKeyTermBank[tempInt].split("SPLDATA");
   _loc3_.glossary.keyterms.title = splKeyTerm[1];
   _loc3_.glossary.keyterms.spanish_title = splKeyTerm[2];
   splKeyTermDesc = splKeyTerm[3].split("~LNG~");
   tempDescription = splKeyTermDesc[0];
   tempSubLink = splKeyTerm[4];
   if(tempSubLink != "" && tempSubLink != undefined && tempSubLink != "undefined")
   {
      splTempSubLink = new Array();
      splTempSubLink = tempSubLink.split("~");
      i = 0;
      while(i < splTempSubLink.length)
      {
         splTempLinkWord = splTempSubLink[i].split(",");
         splTempDesc = tempDescription.split(splTempLinkWord[0]);
         tempLinkVal = "";
         j = 0;
         while(j < splTempDesc.length)
         {
            if(j == 0)
            {
               if(splTempDesc[j] == "")
               {
                  tempLinkVal = "<A HREF=\'asfunction:doGetSubLink," + splTempLinkWord[1] + "~English\'><FONT COLOR=\'#006600\'><U><B>" + splTempLinkWord[0] + "</B></U></FONT></A>";
               }
               else
               {
                  tempLinkVal = splTempDesc[j];
               }
            }
            else if(j == 1)
            {
               if(splTempDesc[j - 1] == "")
               {
                  tempLinkVal += splTempDesc[j];
               }
               else
               {
                  tempLinkVal = tempLinkVal + "<A HREF=\'asfunction:doGetSubLink," + splTempLinkWord[1] + "~English\'><FONT COLOR=\'#006600\'><U><B>" + splTempLinkWord[0] + "</B></U></FONT></A>" + splTempDesc[j];
               }
            }
            else
            {
               tempLinkVal = tempLinkVal + splTempLinkWord[0] + splTempDesc[j];
            }
            j++;
         }
         tempDescription = tempLinkVal;
         i++;
      }
      splTempSpace = tempDescription.split("</A> <A");
      tempFinalKTDef = "";
      i = 0;
      while(i < splTempSpace.length)
      {
         if(tempFinalKTDef == "")
         {
            tempFinalKTDef = splTempSpace[i];
         }
         else
         {
            tempFinalKTDef = tempFinalKTDef + "</A>&nbsp;<A" + splTempSpace[i];
         }
         i++;
      }
      _loc3_.glossary.keyterms.DesEng.htmlText = tempFinalKTDef;
   }
   else
   {
      _loc3_.glossary.keyterms.DesEng.htmlText = tempDescription;
   }
   tempDescription = splKeyTermDesc[1];
   tempSubLink = splKeyTerm[5];
   if(tempSubLink != "" && tempSubLink != undefined && tempSubLink != "undefined")
   {
      splTempSubLink = new Array();
      splTempSubLink = tempSubLink.split("~");
      i = 0;
      while(i < splTempSubLink.length)
      {
         splTempLinkWord = splTempSubLink[i].split(",");
         splTempDesc = tempDescription.split(splTempLinkWord[0]);
         tempLinkVal = "";
         j = 0;
         while(j < splTempDesc.length)
         {
            if(j == 0)
            {
               if(splTempDesc[j] == "")
               {
                  tempLinkVal = "<A HREF=\'asfunction:doGetSubLink," + splTempLinkWord[1] + "~Spanish\'><FONT COLOR=\'#006600\'><U><B>" + splTempLinkWord[0] + "</B></U></FONT></A>";
               }
               else
               {
                  tempLinkVal = splTempDesc[j];
               }
            }
            else if(j == 1)
            {
               if(splTempDesc[j - 1] == "")
               {
                  tempLinkVal += splTempDesc[j];
               }
               else
               {
                  tempLinkVal = tempLinkVal + "<A HREF=\'asfunction:doGetSubLink," + splTempLinkWord[1] + "~Spanish\'><FONT COLOR=\'#006600\'><U><B>" + splTempLinkWord[0] + "</B></U></FONT></A>" + splTempDesc[j];
               }
            }
            else
            {
               tempLinkVal = tempLinkVal + splTempLinkWord[0] + splTempDesc[j];
            }
            j++;
         }
         tempDescription = tempLinkVal;
         i++;
      }
      splTempSpace = tempDescription.split("</A> <A");
      tempFinalKTDef = "";
      i = 0;
      while(i < splTempSpace.length)
      {
         if(tempFinalKTDef == "")
         {
            tempFinalKTDef = splTempSpace[i];
         }
         else
         {
            tempFinalKTDef = tempFinalKTDef + "</A>&nbsp;<A" + splTempSpace[i];
         }
         i++;
      }
      _loc3_.glossary.keyterms.DesSpan.htmlText = tempFinalKTDef;
   }
   else
   {
      _loc3_.glossary.keyterms.DesSpan.htmlText = tempDescription;
   }
   exampleSwfFileName = _loc2_.xmlPath + "DIG/" + splKeyTerm[6].toLowerCase();
   tempSplSndKTFName = splKeyTerm[6].toLowerCase().split(".");
   SndKTEFName = _loc2_.xmlPath + "EAD/" + tempSplSndKTFName[0] + ".mp3";
   SndKTSFName = _loc2_.xmlPath + "SAD/" + tempSplSndKTFName[0] + ".mp3";
   _loc3_.glossary.keyterms.keyterm_diagram.unloadMovie();
   _loc3_.glossary.keyterms.keyterm_diagram.loadMovie(exampleSwfFileName,7);
   if(_loc3_.dtfClicks.text.toUpperCase() == "ON")
   {
      _loc3_.strIndexGlobalButttonClickType = "KTDICT";
      if(_loc2_.LngFlag.toUpperCase() == "ENGLISH")
      {
         strTempIndexGlobalClickDesc = _loc3_.glossary.keyterms.TitleEng.text;
      }
      else
      {
         strTempIndexGlobalClickDesc = _loc3_.glossary.keyterms.TitleSpan.text;
      }
      strTempIndexGlobalClickDesc = strTempIndexGlobalClickDesc.split("&").join("ANDSYM");
      _loc3_.strIndexGlobalClickDesc = strTempIndexGlobalClickDesc;
      _loc3_.strFinalClickURL = "";
      _loc3_.Send_Click_Report_Mc.gotoAndPlay(2);
   }
}
function doPlayKeyTermAudio(mcTemp, strKTAudioLang)
{
   _global.engKTSoundMp3.stop();
   if(eval(mcTemp)._name.toString() == "McKTSAudio")
   {
      _root.glossary.keyterms.McKTEAudio.gotoAndStop(1);
   }
   if(eval(mcTemp)._name.toString() == "McKTEAudio")
   {
      _root.glossary.keyterms.McKTSAudio.gotoAndStop(1);
   }
   if(eval(mcTemp)._name.toString() == "McKTEAudio")
   {
      _root.m_c.McKTSAudio.gotoAndStop(1);
   }
   if(eval(mcTemp)._name.toString() == "McKTSAudio")
   {
      _root.m_c.McKTEAudio.gotoAndStop(1);
   }
   if(eval(mcTemp)._currentframe == 1)
   {
      eval(mcTemp).gotoAndStop(2);
      _global.engKTSoundMp3 = new Sound();
      _global.engKTSoundMp3.onLoad = function(success)
      {
         if(success)
         {
            _global.engKTSoundMp3.start(0);
         }
      };
      if(strKTAudioLang == "English")
      {
         _global.engKTSoundMp3.loadSound(SndKTEFName,false);
      }
      else
      {
         _global.engKTSoundMp3.loadSound(SndKTSFName,false);
      }
      _global.engKTSoundMp3.onSoundComplete = function()
      {
         eval(mcTemp).gotoAndStop(1);
         _global.engKTSoundMp3.stop();
         _global.engKTSoundMp3.unLoad();
      };
   }
   else
   {
      eval(mcTemp).gotoAndStop(1);
      _global.engKTSoundMp3.stop();
   }
}
function doPlayFormulasAudio(mcTemp, strFMAudioLang, strAudioName)
{
   _global.engFMSoundMp3.stop();
   if(eval(mcTemp)._name.toString() == "McFMSAudio")
   {
      _root.Mc_Formulas.McFMEAudio.gotoAndStop(1);
   }
   if(eval(mcTemp)._name.toString() == "McFMEAudio")
   {
      _root.Mc_Formulas.McFMSAudio.gotoAndStop(1);
   }
   if(eval(mcTemp)._currentframe == 1)
   {
      eval(mcTemp).gotoAndStop(2);
      _global.engFMSoundMp3 = new Sound();
      _global.engFMSoundMp3.onLoad = function(success)
      {
         if(success)
         {
            _global.engFMSoundMp3.start(0);
         }
      };
      SndFMEFName = _global.formulasPath + "EAD/" + strAudioName + ".mp3";
      SndFMSFName = _global.formulasPath + "SAD/" + strAudioName + ".mp3";
      if(strFMAudioLang == "English")
      {
         _global.engFMSoundMp3.loadSound(SndFMEFName,false);
      }
      else
      {
         _global.engFMSoundMp3.loadSound(SndFMSFName,false);
      }
      _global.engFMSoundMp3.onSoundComplete = function()
      {
         eval(mcTemp).gotoAndStop(1);
         _global.engFMSoundMp3.stop();
         _global.engFMSoundMp3.unLoad();
      };
   }
   else
   {
      eval(mcTemp).gotoAndStop(1);
      _global.engFMSoundMp3.stop();
   }
}
function doDisplayFormulaDef(strTempET, strTempST, strTempSWF)
{
   var _loc1_ = _root;
   _loc1_.Mc_Formulas.TitleEng.text = strTempET;
   _loc1_.Mc_Formulas.TitleSpan.text = strTempST;
   _loc1_.Mc_Formulas.Mc_FormulaDEF.loadMovie(_global.formulasPath + "SWF/" + strTempSWF + ".swf");
}
function doInitKeyTerms()
{
   var _loc1_ = _root;
   var _loc2_ = _global;
   _loc2_.engKTSoundMp3.stop();
   _loc1_.glossary.keyterms.McKTEAudio.gotoAndStop(1);
   _loc1_.glossary.keyterms.McKTSAudio.gotoAndStop(1);
   _loc1_.glossary.keyterms.BtnBack._visible = false;
   _loc1_.glossary.keyterms.gotoAndStop(1);
   _loc1_.glossary.keyterms.BtnEng._visible = false;
   _loc1_.glossary.keyterms.BtnSpan._visible = true;
   _loc2_.KeyTermVar = _loc2_.xmlPath + "XML/L1KTE01.xml";
   _loc1_.doCreateGlossaryWord("Source");
}
function doClearKeyTermFields()
{
   var _loc1_ = _root;
   _loc1_.glossary.keyterms.Display = "";
   _loc1_.glossary.keyterms.title = "";
   _loc1_.glossary.keyterms.spanish_title = "";
   _loc1_.glossary.keyterms.DesEng.text = "";
   _loc1_.glossary.keyterms.DesSpan.text = "";
   _loc1_.glossary.keyterms.DesEng.html = true;
   _loc1_.glossary.keyterms.DesSpan.html = true;
}
function doVisibleKeyAlphBut()
{
   var _loc1_ = _root;
   var _loc2_ = _global;
   _loc1_.glossary.keyterms.gotoAndStop(1);
   _loc1_.glossary.keyterms.McKTWordList._visible = true;
   _loc1_.glossary.keyterms.a._visible = true;
   _loc1_.glossary.keyterms.b._visible = true;
   _loc1_.glossary.keyterms.c._visible = true;
   _loc1_.glossary.keyterms.d._visible = true;
   _loc1_.glossary.keyterms.e._visible = true;
   _loc1_.glossary.keyterms.f._visible = true;
   _loc1_.glossary.keyterms.g._visible = true;
   _loc1_.glossary.keyterms.h._visible = true;
   _loc1_.glossary.keyterms.useri._visible = true;
   _loc1_.glossary.keyterms.j._visible = true;
   _loc1_.glossary.keyterms.userk._visible = true;
   _loc1_.glossary.keyterms.l._visible = true;
   _loc1_.glossary.keyterms.m._visible = true;
   _loc1_.glossary.keyterms.n._visible = true;
   _loc1_.glossary.keyterms.o._visible = true;
   _loc1_.glossary.keyterms.p._visible = true;
   _loc1_.glossary.keyterms.q._visible = true;
   _loc1_.glossary.keyterms.r._visible = true;
   _loc1_.glossary.keyterms.s._visible = true;
   _loc1_.glossary.keyterms.t._visible = true;
   _loc1_.glossary.keyterms.u._visible = true;
   _loc1_.glossary.keyterms.v._visible = true;
   _loc1_.glossary.keyterms.w._visible = true;
   _loc1_.glossary.keyterms.x._visible = true;
   _loc1_.glossary.keyterms.y._visible = true;
   _loc1_.glossary.keyterms.z._visible = true;
   if(_loc2_.btnKeyTermsPressed != "" && _loc2_.btnKeyTermsPressed != undefined)
   {
      _loc1_.glossary.keyterms[_loc2_.btnKeyTermsPressed]._visible = false;
      _loc1_.glossary.keyterms.mouse_down._x = _loc1_.glossary.keyterms[_loc2_.btnKeyTermsPressed]._x;
      _loc1_.glossary.keyterms.mouse_down._y = _loc1_.glossary.keyterms[_loc2_.btnKeyTermsPressed]._y;
   }
}
function doCreateButAction(tempCat)
{
   var _loc1_ = _root;
   var _loc2_ = tempCat;
   _loc1_.doCreateGlossAlph("Source",_loc2_);
   if(_loc2_ == "i")
   {
      _loc2_ = "useri";
   }
   if(_loc2_ == "k")
   {
      _loc2_ = "userk";
   }
   _global.btnKeyTermsPressed = _loc2_;
   _loc1_.doVisibleKeyAlphBut();
   _loc1_.glossary.keyterms[_loc2_]._visible = false;
   _loc1_.glossary.keyterms.mouse_down._x = _loc1_.glossary.keyterms[_loc2_]._x;
   _loc1_.glossary.keyterms.mouse_down._y = _loc1_.glossary.keyterms[_loc2_]._y;
   _loc1_.glossary.keyterms.DesEng.text = "";
   _loc1_.glossary.keyterms.title = "";
   _loc1_.glossary.keyterms.spanish_title = "";
   _loc1_.glossary.keyterms.DesSpan.text = "";
}
function doKeyTermsReset()
{
   var _loc1_ = _root;
   var _loc2_ = _global;
   _loc1_.doVisibleKeyAlphBut();
   _loc1_.glossary.keyterms.mouse_down._x = _loc1_.glossary.keyterms.x_pos;
   _loc1_.glossary.keyterms.mouse_down._y = _loc1_.glossary.keyterms.y_pos;
   _loc1_.glossary.keyterms.DesEng.text = "";
   _loc1_.glossary.keyterms.title = "";
   _loc1_.glossary.keyterms.spanish_title = "";
   _loc1_.glossary.keyterms.DesSpan.text = "";
   if(_loc2_.LngFlag == "English")
   {
      _loc2_.KeyTermVar = _loc2_.xmlPath + "XML/L1KTE01.xml";
   }
   else
   {
      _loc2_.KeyTermVar = _loc2_.xmlPath + "XML/L1KTS01.xml";
   }
   _loc1_.doCreateGlossaryWord("Source");
}
function doSwitchSpanGloss()
{
   var _loc1_ = _root;
   var _loc2_ = _global;
   _loc1_.doVisibleKeyAlphBut();
   _loc1_.glossary.keyterms.mouse_down._x = _loc1_.glossary.keyterms.x_pos;
   _loc1_.glossary.keyterms.mouse_down._y = _loc1_.glossary.keyterms.y_pos;
   _loc1_.glossary.keyterms.BtnSpan._visible = false;
   _loc1_.glossary.keyterms.BtnEng._visible = true;
   _loc1_.mover_mc.gotoAndStop("inactive");
   _loc2_.KeyTermVar = _loc2_.xmlPath + "XML/L1KTS01.xml";
   _loc2_.LngFlag = "Spanish";
   _loc1_.doCreateGlossaryWord("Source");
}
function doSwitchEngGloss()
{
   var _loc1_ = _root;
   var _loc2_ = _global;
   _loc1_.doVisibleKeyAlphBut();
   _loc1_.glossary.keyterms.mouse_down._x = _loc1_.glossary.keyterms.x_pos;
   _loc1_.glossary.keyterms.mouse_down._y = _loc1_.glossary.keyterms.y_pos;
   _loc1_.glossary.keyterms.BtnEng._visible = false;
   _loc1_.glossary.keyterms.BtnSpan._visible = true;
   _loc1_.mover_mc.gotoAndStop("inactive");
   _loc2_.KeyTermVar = _loc2_.xmlPath + "XML/L1KTE01.xml";
   _loc2_.LngFlag = "English";
   _loc1_.doCreateGlossaryWord("Source");
}
function doInitSKT()
{
   var _loc1_ = _root;
   _loc1_.m_c.stop();
   _loc1_.m_c.keyterm_diagram.unloadMovie();
   _loc1_.m_c.BtnBack._visible = false;
   _loc1_.Activ();
}
function doCreateSKTSubLink(subLinkWord)
{
   var _loc1_ = _root;
   var _loc2_ = subLinkWord;
   var _loc3_ = _global;
   if(_loc3_.openScrKey)
   {
      _loc1_.m_c.BtnBack._visible = false;
      _loc3_.openScrKey = false;
   }
   else
   {
      _loc1_.m_c.BtnBack._visible = true;
   }
   _loc1_.m_c.english = "";
   _loc1_.m_c.spanish = "";
   _loc1_.m_c.title_english = "";
   _loc1_.m_c.Keycontent_english.htmlText = "";
   _loc1_.m_c.title_spanish = "";
   _loc1_.m_c.Keycontent_spanish.htmlText = "";
   _loc1_.m_c.english = "English";
   _loc1_.m_c.spanish = "Spanish";
   _loc1_.m_c.Keycontent_english.html = true;
   _loc1_.m_c.Keycontent_english.multiline = true;
   _loc1_.m_c.Keycontent_english.wordWrap = true;
   _loc1_.m_c.Keycontent_spanish.html = true;
   _loc1_.m_c.Keycontent_spanish.multiline = true;
   _loc1_.m_c.Keycontent_spanish.wordWrap = true;
   splSubLinkWord = _loc2_.split("~");
   tempInt = "";
   chkSubInt = 0;
   i = 0;
   while(i < _loc3_.arrKeyTermBank.length)
   {
      splKeyTerm = _loc3_.arrKeyTermBank[i].split("SPLDATA");
      if(splSubLinkWord[1] == "English")
      {
         tempLangChkWord = splKeyTerm[1];
      }
      else
      {
         tempLangChkWord = splKeyTerm[2];
      }
      if(splKeyTerm[1].toLowerCase() == splSubLinkWord[0].toLowerCase())
      {
         tempLangChkWord = splKeyTerm[1];
      }
      else if(splKeyTerm[2].toLowerCase() == splSubLinkWord[0].toLowerCase())
      {
         tempLangChkWord = splKeyTerm[2];
      }
      tempSubLinkWord = splSubLinkWord[0];
      if(tempSubLinkWord.indexOf("_") == -1)
      {
         _loc2_ = splSubLinkWord[0];
         if(tempLangChkWord.toLowerCase() == _loc2_.toLowerCase())
         {
            chkSubInt++;
            if(chkSubInt == 1)
            {
               tempInt = i;
            }
         }
      }
      else
      {
         tempSplSubLinkWord = tempSubLinkWord.split("_");
         _loc2_ = tempSplSubLinkWord[0];
         if(tempLangChkWord.toLowerCase() == _loc2_.toLowerCase())
         {
            chkSubInt++;
            if(Number(tempSplSubLinkWord[1]) == chkSubInt)
            {
               tempInt = i;
            }
         }
      }
      i++;
   }
   splKeyTerm = _loc3_.arrKeyTermBank[tempInt].split("SPLDATA");
   _loc1_.m_c.title_english = splKeyTerm[1];
   _loc1_.m_c.title_spanish = splKeyTerm[2];
   splKeyTermDesc = splKeyTerm[3].split("~LNG~");
   tempDescription = splKeyTermDesc[0];
   tempSubLink = splKeyTerm[4];
   if(tempSubLink != "" && tempSubLink != undefined && tempSubLink != "undefined")
   {
      splTempSubLink = new Array();
      splTempSubLink = tempSubLink.split("~");
      i = 0;
      while(i < splTempSubLink.length)
      {
         splTempLinkWord = splTempSubLink[i].split(",");
         splTempDesc = tempDescription.split(splTempLinkWord[0]);
         tempLinkVal = "";
         j = 0;
         while(j < splTempDesc.length)
         {
            if(j == 0)
            {
               if(splTempDesc[j] == "")
               {
                  tempLinkVal = "<A HREF=\'asfunction:doGetSubLink," + splTempLinkWord[1] + "~English\'><FONT COLOR=\'#006600\'><U><B>" + splTempLinkWord[0] + "</B></U></FONT></A>";
               }
               else
               {
                  tempLinkVal = splTempDesc[j];
               }
            }
            else if(j == 1)
            {
               if(splTempDesc[j - 1] == "")
               {
                  tempLinkVal += splTempDesc[j];
               }
               else
               {
                  tempLinkVal = tempLinkVal + "<A HREF=\'asfunction:doGetSubLink," + splTempLinkWord[1] + "~English\'><FONT COLOR=\'#006600\'><U><B>" + splTempLinkWord[0] + "</B></U></FONT></A>" + splTempDesc[j];
               }
            }
            else
            {
               tempLinkVal = tempLinkVal + splTempLinkWord[0] + splTempDesc[j];
            }
            j++;
         }
         tempDescription = tempLinkVal;
         i++;
      }
      splTempSpace = tempDescription.split("</A> <A");
      tempFinalKTDef = "";
      i = 0;
      while(i < splTempSpace.length)
      {
         if(tempFinalKTDef == "")
         {
            tempFinalKTDef = splTempSpace[i];
         }
         else
         {
            tempFinalKTDef = tempFinalKTDef + "</A>&nbsp;<A" + splTempSpace[i];
         }
         i++;
      }
      _loc1_.m_c.Keycontent_english.htmlText = tempFinalKTDef;
   }
   else
   {
      _loc1_.m_c.Keycontent_english.htmlText = tempDescription;
   }
   tempDescription = splKeyTermDesc[1];
   tempSubLink = splKeyTerm[5];
   if(tempSubLink != "" && tempSubLink != undefined && tempSubLink != "undefined")
   {
      splTempSubLink = new Array();
      splTempSubLink = tempSubLink.split("~");
      i = 0;
      while(i < splTempSubLink.length)
      {
         splTempLinkWord = splTempSubLink[i].split(",");
         splTempDesc = tempDescription.split(splTempLinkWord[0]);
         tempLinkVal = "";
         j = 0;
         while(j < splTempDesc.length)
         {
            if(j == 0)
            {
               if(splTempDesc[j] == "")
               {
                  tempLinkVal = "<A HREF=\'asfunction:doGetSubLink," + splTempLinkWord[1] + "~Spanish\'><FONT COLOR=\'#006600\'><U><B>" + splTempLinkWord[0] + "</B></U></FONT></A>";
               }
               else
               {
                  tempLinkVal = splTempDesc[j];
               }
            }
            else if(j == 1)
            {
               if(splTempDesc[j - 1] == "")
               {
                  tempLinkVal += splTempDesc[j];
               }
               else
               {
                  tempLinkVal = tempLinkVal + "<A HREF=\'asfunction:doGetSubLink," + splTempLinkWord[1] + "~Spanish\'><FONT COLOR=\'#006600\'><U><B>" + splTempLinkWord[0] + "</B></U></FONT></A>" + splTempDesc[j];
               }
            }
            else
            {
               tempLinkVal = tempLinkVal + splTempLinkWord[0] + splTempDesc[j];
            }
            j++;
         }
         tempDescription = tempLinkVal;
         i++;
      }
      splTempSpace = tempDescription.split("</A> <A");
      tempFinalKTDef = "";
      i = 0;
      while(i < splTempSpace.length)
      {
         if(tempFinalKTDef == "")
         {
            tempFinalKTDef = splTempSpace[i];
         }
         else
         {
            tempFinalKTDef = tempFinalKTDef + "</A>&nbsp;<A" + splTempSpace[i];
         }
         i++;
      }
      _loc1_.m_c.Keycontent_spanish.htmlText = tempFinalKTDef;
   }
   else
   {
      _loc1_.m_c.Keycontent_spanish.htmlText = tempDescription;
   }
   exampleSwfFileName = _loc3_.xmlPath + "DIG/" + splKeyTerm[6].toLowerCase();
   _loc1_.m_c.keyterm_diagram.unloadMovie();
   _loc1_.m_c.keyterm_diagram.loadMovie(exampleSwfFileName,6);
   tempSplSndKTFName = splKeyTerm[6].toLowerCase().split(".");
   SndKTEFName = _loc3_.xmlPath + "EAD/" + tempSplSndKTFName[0] + ".mp3";
   SndKTSFName = _loc3_.xmlPath + "SAD/" + tempSplSndKTFName[0] + ".mp3";
   if(_loc1_.dtfClicks.text.toUpperCase() == "ON" && _loc1_.boolMcVisible == false)
   {
      _loc1_.strIndividualButttonClickType = "KTHL";
      strTempIndividualClickDesc = _loc1_.m_c.title_english + "~" + _loc1_.m_c.title_spanish;
      strTempIndividualClickDesc = strTempIndividualClickDesc.split("&").join("ANDSYM");
      _loc1_.strIndividualClickDesc = strTempIndividualClickDesc;
      _loc1_.strFinalClickURL = "";
      _loc1_.Send_Click_Report_Mc.gotoAndPlay(6);
   }
}
function doSKTClose()
{
   var _loc1_ = _global;
   _loc1_.Play = true;
   _loc1_.Pause = false;
   _loc1_.CompClick = "";
   _root.m_c._visible = false;
   _loc1_.engKTSoundMp3.stop();
}
function doCloseApp()
{
   getURL("javascript:parent.close();");
}
function doCheckSpanishAudio()
{
   var _loc1_ = _root;
   var _loc2_ = _global;
   if(_loc1_.dtfSPANISH.text.toUpperCase() == "ON")
   {
      if(_loc2_.spanSound != true)
      {
         if(_loc2_.newTitleTag == true)
         {
            if(_loc2_.sectionNumber >= 0 && _loc2_.sectionNumber < _loc2_.arrayTotalSectionDetails.length)
            {
               tempString = _loc2_.playSwfFileName.substring(_loc2_.playSwfFileName.length - 6,_loc2_.playSwfFileName.length);
               if(tempString.toUpperCase() != "01.SWF")
               {
                  _loc1_.SA._visible = true;
                  _loc1_.EA._visible = true;
                  _loc1_.SA._alpha = 100;
                  _loc1_.EA._alpha = 100;
               }
               else
               {
                  _loc1_.SA._visible = false;
                  _loc1_.EA._visible = false;
                  _loc1_.SA._alpha = 0;
                  _loc1_.EA._alpha = 0;
               }
            }
            else
            {
               _loc1_.SA._visible = false;
               _loc1_.EA._visible = false;
               _loc1_.SA._alpha = 0;
               _loc1_.EA._alpha = 0;
            }
         }
         else if(_loc2_.sectionNumber >= 1 && _loc2_.sectionNumber < _loc2_.arrayTotalSectionDetails.length)
         {
            tempString = _loc2_.playSwfFileName.substring(_loc2_.playSwfFileName.length - 6,_loc2_.playSwfFileName.length);
            if(tempString.toUpperCase() != "01.SWF")
            {
               _loc1_.SA._visible = true;
               _loc1_.EA._visible = true;
               _loc1_.SA._alpha = 100;
               _loc1_.EA._alpha = 100;
            }
            else
            {
               _loc1_.SA._visible = false;
               _loc1_.EA._visible = false;
               _loc1_.SA._alpha = 0;
               _loc1_.EA._alpha = 0;
            }
         }
         else
         {
            _loc1_.SA._visible = false;
            _loc1_.EA._visible = false;
            _loc1_.SA._alpha = 0;
            _loc1_.EA._alpha = 0;
         }
      }
   }
   else
   {
      _loc1_.SA._visible = false;
      _loc1_.EA._visible = false;
      _loc1_.SA._alpha = 0;
      _loc1_.EA._alpha = 0;
   }
}
focusrect = false;
fscommand("fullscreen","true");
fscommand("allowscale","true");
fscommand("showmenu","false");
fscommand("trapallkeys","true");
_global.arrDetails_Split = new Array();
_global.arrDetails_Split = LessonDetails.split("[Details_Split]");
_global.arrCourse_Details = new Array();
_global.arrCourse_Details = _global.arrDetails_Split[0].split("~");
_global.arrRndAudioDetails_Split = new Array();
_global.arrRndAudioDetails_Split = RandomAudioDetails.split("[Details_Split]");
_global.arrBGTextDetails_Split = new Array();
_global.arrBGTextDetails_Split = BGTextDetails.split("[Details_Split]");
_global.arrayTotalSectionDetails = new Array();
_global.arrayTotalRndAudioDetails = new Array();
_global.arrayTotalBgTextDetails = new Array();
i = 1;
while(i < _global.arrDetails_Split.length)
{
   _global.arrayTotalSectionDetails.push(_global.arrDetails_Split[i]);
   i++;
}
i = 0;
while(i < _global.arrRndAudioDetails_Split.length)
{
   _global.arrayTotalRndAudioDetails.push(_global.arrRndAudioDetails_Split[i]);
   i++;
}
i = 0;
while(i < _global.arrBGTextDetails_Split.length)
{
   _global.arrayTotalBgTextDetails.push(_global.arrBGTextDetails_Split[i]);
   i++;
}
_global.BmId = "";
_global.tempBook = "";
_global.splitStart = 0;
_global.splitEnd = 0;
_global.sectionNumber = -1;
_global.slideNumber = 0;
_global.startTime = 0;
_global.autoLoadMovie = false;
_global.lngEng = new Array();
_global.lngSpan = new Array();
_global.DescArray = new Array();
_global.KeyAttribute = "";
_global.KeyLngEng = "";
_global.KeyLngSpan = "";
_global.KeyTotDescText = "";
_global.KeyTermVar = keyTermVar;
_global.BackFlag = false;
_global.LngFlag = "English";
_global.arrGoBack = new Array();
_global.arrFinishSlide = new Array();
_global.quizSection = false;
_global.playaction = false;
_global.Mute = false;
_global.Pause = false;
_global.Play = true;
_global.CompClick = "";
_global.gSound = new Sound();
_global.VolLevel = 100;
_global.needMoreBackURL = "";
_global.randomAudio = false;
_global.spanSound = false;
_global.arrKeyTermBank = new Array();
_global.backLinkWord = "";
_global.openScrKey = true;
_global.closeApp = "no";
_global.showLoading_Spanish = false;
_root.txtWarnText._visible = false;
_root.MCtxtWarnSAText._visible = false;
_root.MCtxtWarnSAText._alpha = 0;
_root.preLoading = false;
_root.chkSlideNumber = 0;
_global.btnKeyTermsPressed = undefined;
_root.strJSFlashVar = "";
_root.boolNotepadClicked = false;
_root.strNotepadPage = "";
_root.boolWallClicked = false;
_root.strWallPage = "";
_root.strFinalClickURL = "";
_root.strIndexGlobalButttonClickType = "";
_root.strIndexGlobalClickDesc = "";
_root.strIndexGlobalButttonClickPage = "";
_root.intIndexGlobalButttonClickCount = "";
_root.intIndexKTButtonClickCount = 0;
_root.intIndexCALCButtonClickCount = 0;
_root.intIndexSPAudioButtonClickCount = 0;
_root.intIndexNextButtonClickCount = 0;
_root.intIndexPreviousButtonClickCount = 0;
_root.intIndexReplayButtonClickCount = 0;
_root.intIndexPauseButtonClickCount = 0;
_root.intIndexPlayButtonClickCount = 0;
_root.intIndexMuteButtonClickCount = 0;
_root.intIndexUnMuteButtonClickCount = 0;
_root.intIndexHelpButtonClickCount = 0;
_root.strIndividualButttonClickPage = "";
_root.strIndividualButttonClickType = "";
_root.strIndividualClickDesc = "";
myCookie = SharedObject.getLocal("cookiename");
tempFLCookieCount = 0;
_global.arrayFLCookie = new Array();
_root.Mc_ToolTip_Bg._alpha = 0;
_root.Mc_ToolTip_Bg._visible = false;
_global.arrayRemoveVBSubTitleMc = new Array();
_global.arrayRemoveINSubTitleMc = new Array();
_global.arrayRemoveTSSubTitleMc = new Array();
NavigationButtonsONOFF = "";
_global.strLNG = "";
_root.onEnterFrame = function()
{
   _root.animation_mc_preload.stop();
   if(_global.showLoading_Spanish)
   {
      if(_global.spanSoundMp3.position > 0)
      {
         _global.showLoading_Spanish = false;
         _root.MCtxtWarnSAText._visible = false;
         _root.MCtxtWarnSAText._alpha = 0;
      }
      else
      {
         _root.MCtxtWarnSAText._visible = true;
         _root.MCtxtWarnSAText._alpha = 100;
      }
   }
   else
   {
      _root.MCtxtWarnSAText._visible = false;
      _root.MCtxtWarnSAText._alpha = 0;
   }
   if(_global.newTitleTag == true)
   {
      _root.animation_mc.Mc_Page_Title._visible = false;
      _root.animation_mc["Mc_Page_Title  "]._visible = false;
      _root.animation_mc.animation.Mc_Page_Title._visible = false;
      _root.animation_mc.animation["Mc_Page_Title  "]._visible = false;
   }
   if(_global.playSwfFileName.indexOf("FQ02") != -1 || _global.playSwfFileName.indexOf("FQ03") != -1)
   {
      if(_global.strFQTempLabel != undefined && "Q" + Number(_root.animation_mc.animation._currentframe - 1).toString() != _global.strFQTempLabel || _root.animation_mc.animation.Mc_Finish._visible == true)
      {
         _global.strFQTempLabel = "Q" + Number(_root.animation_mc.animation._currentframe - 1).toString();
         _global.sndFQSound.stop();
         _global.sndFQSound.unLoad();
         _root.animation_mc.animation.Mc_Quiz_Audio.gotoAndStop(1);
         i = 1;
         while(i <= 4)
         {
            eval("_root.animation_mc.animation.Mc_Quiz_Audio_" + i).gotoAndStop(1);
            i++;
         }
      }
   }
};
if(_root.preloader_mc.tempPerc >= 100 && _root.dtfSPANISH.text != "" && _root.dtfSPANISH.text != undefined && _root.dtfSPANISH.text != "undefined")
{
   gotoAndStop("start");
   play();
}
if(_root.preloader_mc.tempPerc >= 100 && _root.dtfSPANISH.text == "" || _root.dtfSPANISH.text == undefined || _root.dtfSPANISH.text == "undefined")
{
   _root.stop();
   _root.bar._visible = false;
   _root.dtfLOAD._visible = false;
   _root.ShowLogin_Error_Mc._visible = true;
   _root.ShowLogin_Error_Mc.gotoAndStop(2);
}
if(_root.dtfSPANISH.text == "" || _root.dtfSPANISH.text == undefined || _root.dtfSPANISH.text == "undefined")
{
   _global.MainFilePath = "~*&!@#$%^()_+|";
   _global.xmlPath = "~*&!@#$%^()_+|";
   _global.formulasPath = "~*&!@#$%^()_+|";
}
else
{
   _global.MainFilePath = _global.ServerRoot + "/";
   _global.xmlPath = _global.ServerRoot + "/HELP_KEYTERMS/KT/";
   _global.formulasPath = _global.ServerRoot + "/HELP_FORMULAS/";
}
if(_root.Report_URL == "" || _root.Report_URL == "undefined" || _root.Report_URL == undefined)
{
   _root.getBookMark();
}
if(_root.Student_Help_URL == "" || _root.Student_Help_URL == "undefined" || _root.Student_Help_URL == undefined)
{
   _root.BtnHelp._visible = false;
}
