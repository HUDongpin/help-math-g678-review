stop();
_global.rndAudio = new Array();
_global.rndAudio[0] = "S1";
_global.rndAudio[1] = "S2";
_global.rndAudio[2] = "S3";
_global.rndAudio[3] = "S4";
tempInt = random(_global.rndAudio.length);
tempLabel = _global.rndAudio[tempInt];
gotoAndPlay(tempLabel);
