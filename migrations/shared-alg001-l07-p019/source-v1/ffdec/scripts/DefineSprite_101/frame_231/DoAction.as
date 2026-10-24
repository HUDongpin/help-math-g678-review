function DrawPlot()
{
   obj = Anim;
   obj.clear();
   obj.lineStyle(2,255,100);
   i = 0;
   while(PixelWidth >= i)
   {
      x = i * xscale + xstt;
      y = m * x + c;
      j = (yend - y) / xscale;
      if(i == 0)
      {
         obj.moveTo(i,j);
      }
      else
      {
         obj.lineTo(i,j);
      }
      i++;
   }
}
function UpdateSlope(NewSlope)
{
   m = NewSlope;
   UpdateFormula();
   DrawPlot();
}
function UpdateC(NewC)
{
   c = NewC;
   UpdateFormula();
   DrawPlot();
}
function UpdateFormula()
{
   tempVal = AlgebraPhrase(Array(c,m));
   if(tempVal != "")
   {
      tempSpl = tempVal.toString().split(",");
      _global.slope = tempSpl[1];
      _global.c = tempSpl[0];
   }
}
function AlgebraPhrase(a)
{
   var _loc2_ = a;
   var _loc1_ = "";
   for(k in _loc2_)
   {
      v = _loc2_[k];
      if(v != 0)
      {
         if(v < 0)
         {
            _loc1_ += " - ";
            v = - v;
         }
         else if(_loc1_.length > 0)
         {
            _loc1_ += " + ";
         }
         k;
         switch(k)
         {
            case 0:
               _loc1_ += v;
               break;
            case 1:
               if(v != 1)
               {
                  _loc1_ += v;
               }
               _loc1_ += "x";
               break;
            default:
               if(v != 1)
               {
                  _loc1_ += v;
               }
               _loc1_ += "(" + k + ")";
         }
      }
   }
   if(_loc1_.length == 0)
   {
      _loc1_ = "0";
   }
   return _loc2_;
}
_global.slope = "1";
_global.c = "0";
PixelWidth = 255;
xstt = -10;
xend = 10;
span = xend - xstt;
xscale = span / PixelWidth;
ystt = -10;
yend = ystt + span;
depth = 100;
m = 1;
c = 0;
DrawPlot();
onEnterFrame = function()
{
   FormulaText.txtSlope = _global.slope;
   FormulaText.txtC = _global.c;
};
stop();
