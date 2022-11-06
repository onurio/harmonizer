const Max = require("max-api");
var voices = [];
var currentPitch = undefined;
var currentPreset = { name: "new preset", mapping: {} };
const MS = require("musictheoryjs");
let mode = "MIDI";
let currentScale = MS.ScaleTemplates["major"];
let latchMode = false;
// Max.outlet("scales", ...Object.keys(MS.ScaleTemplates));

const resetNotes = [0, 0, 0, 0];

Max.addHandler("scale", (scale) => {
  currentScale = MS.ScaleTemplates[scale];
  Max.post("scale", MS.ScaleTemplates[scale]);
});

Max.addHandler("harm-in", (...arr) => {
  assignHarmony(arr);
  outputHarmony();
});

Max.addHandler("latchMode", (m) => {
  latchMode = m;
});

Max.addHandler("mode", (type) => {
  mode = type;
});

Max.addHandler("note-in", (pitch) => {
  if (mode === "MIDI") {
    midiHarmonize(pitch);
  } else {
    autoHarmonize(pitch);
  }
});

const autoHarmonize = (pitch) => {
  currentPitch = pitch;
  var chord = new MS.Scale(currentScale).notes.map((n) => n._tone);
  // chord.pitch = currentPitch;
  Max.post(chord);

  var chord2 = new MS.Scale(currentScale).shift(1).notes.map((n) => n._tone);
  Max.post(chord2);

  // if (chord) {
  //   var first = chord[0];

  //   var arr = chord.map(function (v) {
  //     if (v === null) {
  //       return 0;
  //     } else {
  //       return v - first;
  //     }
  //   });
  //   outputNotes(resetNotes);
  //   outputNotes(arr);
  // } else {
  //   outputNotes(resetNotes);
  // }
};

const midiHarmonize = (pitch) => {
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
    outputNotes(arr);
  } else if (latchMode) {
    outputNotes(resetNotes);
  }
};

const outputHarmony = () => {
  var first = voices[0];

  var arr = voices.map(function (v) {
    if (v === null) {
      return 0;
    } else {
      return v - first;
    }
  });
  outputNotes(arr);
};

const outputNotes = (notes) => {
  Max.outlet(["notes", ...notes]);
};

const assignHarmony = (arr) => {
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
};
