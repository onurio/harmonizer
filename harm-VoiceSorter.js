var voices = [];
var currentPitch = undefined;
var currentPreset = { name: "new preset", mapping: {} };
outlets = 2;

function bang() {
  var first = voices[0];

  var arr = voices.map(function (v) {
    if (v === null) {
      return 0;
    } else {
      return v - first;
    }
  });
  outlet(0, arr);
}

function msg_int(pitch) {
  currentPitch = pitch;
  var chord = currentPreset.mapping[pitch];
  if (chord) {
    var first = chord[0];

    var arr = chord.map(function (v) {
      if (v === null) {
        return 0;
      } else {
        return v - first;
      }
    });
    outlet(0, 0, 0, 0, 0);
    outlet(0, arr);
  } else {
    outlet(0, 0, 0, 0, 0);
  }
}

function list() {
  const arr = arrayfromargs(arguments);
  const vel = arr[2];
  const pitch = arr[1];
  const voice = arr[0];
  if (vel == 0) {
    voices[voice - 1] = null;
  } else {
    voices[voice - 1] = pitch;
    currentPreset.mapping[currentPitch] = voices.map(function (v) {
      return v;
    });
  }

  bang();
}
