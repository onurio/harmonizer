const Max = require("max-api");
const fs = require("fs");
var voices = [];
var currentVoicesIndex = 0;
var currentPitch = undefined;
var currentPreset = { name: "new preset", mapping: [{}, {}] };
const MS = require("musictheoryjs");
let mode = "MIDI";
let currentScale = MS.ScaleTemplates["major"];
let latchMode = false;
let lockMode = false;
// Max.outlet("scales", ...Object.keys(MS.ScaleTemplates));

const resetNotes = [0, 0, 0, 0];

Max.addHandler("scale", (scale) => {
	currentScale = MS.ScaleTemplates[scale];
	Max.post("scale", MS.ScaleTemplates[scale]);
});

Max.addHandler("harm-in", (...arr) => {
	if (lockMode) return;
	assignHarmony(arr);
	outputHarmony();
});

Max.addHandler("latchMode", (m) => {
	latchMode = m;
});

Max.addHandler("lockMode", (m) => {
	lockMode = m;
});

Max.addHandler("voicesPart", (i) => {
	currentVoicesIndex = i;
	outputHarmony();
});

Max.addHandler("savePreset", (name) => {
	Max.post("saving preset");
	currentPreset.name = name;
	if (!fs.existsSync("presets")) fs.mkdirSync("presets");
	fs.writeFileSync(
		`./presets/${currentPreset.name}.json`,
		JSON.stringify(currentPreset)
	);
});

Max.addHandler("loadPreset", (name) => {
	Max.post("loading preset " + name);
	currentPreset = JSON.parse(fs.readFileSync(`./presets/${name}`));
	Max.post(currentPreset);
	outputHarmony();
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
	var chord = currentPreset.mapping[currentVoicesIndex][pitch];
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
		currentPreset.mapping[currentVoicesIndex][currentPitch] = [...voices];
	}
};
