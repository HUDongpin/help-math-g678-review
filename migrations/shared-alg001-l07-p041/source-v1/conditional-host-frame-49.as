function setAll()
{
   reintKTermsBox();
   _root.keyterms_but.enabled = true;
}
function Deact()
{
   resetAll();
   reintKTermsBox();
   _root.deactAll._visible = true;
   _root.deactAll.useHandCursor = false;
}
function Activ()
{
   setAll();
   _root.deactAll._visible = false;
   _root.deactAll.useHandCursor = false;
}
titleIMGPath = _global.ServerRoot + "/" + _global.CourseTitleName;
_root.Mc_Course_Title.loadMovie(titleIMGPath + "Temp");
_root.Mc_Course_Title._visible = false;
txtNewTitle.wordWrap = true;
txtNewTitle.text = "";
_root.ALG001._visible = false;
_root.GEO001._visible = false;
_root.DAT001._visible = false;
_root.NMS002._visible = false;
_root.Mc_ALG001._alpha = 0;
_root.Mc_NMS002._alpha = 0;
_root.Mc_GEO001._alpha = 0;
_root.Mc_DAT001._alpha = 0;
switch(_global.CourseTitleName.toString())
{
   case "HELP_COURSES/ALG001/ALG001.jpg":
      _root.Mc_ALG001._alpha = 100;
      break;
   case "HELP_COURSES/NMS002/NMS002.jpg":
      _root.Mc_NMS002._alpha = 100;
      break;
   case "HELP_COURSES/GEO001/GEO001.jpg":
      _root.Mc_GEO001._alpha = 100;
      break;
   case "HELP_COURSES/DAT001/DAT001.jpg":
      _root.Mc_DAT001._alpha = 100;
}
_root.Mc_Result._visible = false;
_root.Mc_Finish._visible = false;
_root.Mc_Finish.gotoAndStop(1);
_root.top._y = _root.top_initial._y;
_root.bottom._y = _root.bottom_initial._y;
Activ();
if(_global.bookMark != false && _root.dtfBMID.text != "" && _root.dtfBMID.text != undefined && _root.dtfBMID.text != "undefined")
{
   _root.stop();
   _root.bookmark_mc.gotoAndStop(2);
}
else if(_global.sectionNumber < 0 || _global.sectionNumber == undefined)
{
   _global.sectionNumber = 0;
   _global.slideNumber = 2;
   newTempSpl = _global.arrayTotalSectionDetails[_global.sectionNumber].split("~");
   _global.playSwfFileName = _global.MainFilePath + newTempSpl[_global.slideNumber];
}
