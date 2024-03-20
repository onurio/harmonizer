# Harmonizer

Harmonizer device for Max/AbletonLive. 

## Usage
1. To send midi to the device use the `midiSend.amxd` device by putting it on a MIDI channel.
2. Put the `PitchDetect.maxpat` and `Harmonizer-Direct-Relative.amxd` on the audio channel you would like to harmonize.

The harmonizer saves each chord you play on the note that is received, this removes the need of continuously update the preset. You can also save the preset and reuse it.