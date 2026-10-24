stop();
_global.quizSection = true;
_global.arrayColor = new Array();
_global.arrayColor = ["Dummy","0x0066FF","0x00FFFF","0x00FF33","0xFE6DFE"];
i = 1;
while(i <= 4)
{
   theColor = new Color(eval("Mc_Chart_Circle_" + i));
   theColor.setRGB(_global.arrayColor[i]);
   eval("Mc_Chart_Circle_" + i)._alpha = 100;
   i++;
}
Mc_Chart_Circle_4._rotation = 0;
Mc_Chart_Circle_4._yscale = -100;
Mc_Chart_Circle_1.gotoAndStop(26);
Mc_Chart_Circle_2.gotoAndStop(26);
Mc_Chart_Circle_3.gotoAndStop(26);
Mc_Chart_Circle_4.gotoAndStop(26);
onEnterFrame = function()
{
   if(Mc_Drag_1.drag)
   {
      Mc_Chart_Circle_1.gotoAndStop(Number(txtSlope_1.text) + 1);
   }
   if(Mc_Drag_2.drag)
   {
      Mc_Chart_Circle_2.gotoAndStop(Number(txtSlope_2.text) + 1);
   }
   if(Mc_Drag_3.drag)
   {
      Mc_Chart_Circle_3.gotoAndStop(Number(txtSlope_3.text) + 1);
   }
   if(Mc_Drag_4.drag)
   {
      Mc_Chart_Circle_4.gotoAndStop(Number(txtSlope_4.text) + 1);
   }
   if(Number(txtSlope_1.text) == 0)
   {
      txt_F_1_N.text = 0;
      txt_F_1_D.text = 100;
   }
   if(Number(txtSlope_2.text) == 0)
   {
      txt_F_2_N.text = 0;
      txt_F_2_D.text = 100;
   }
   if(Number(txtSlope_3.text) == 0)
   {
      txt_F_3_N.text = 0;
      txt_F_3_D.text = 100;
   }
   if(Number(txtSlope_4.text) == 0)
   {
      txt_F_4_N.text = 0;
      txt_F_4_D.text = 100;
   }
};
