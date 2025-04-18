// app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WaveformStore } from './store/waveform/waveform.store';
import { Observable } from 'rxjs';
import { pianoNotesFrequencies, PianoNoteFrequency } from './helpers/pianoNoteFrequencies';
import { AudioService } from './services/audio.service';

interface KeyboardMapping {
  [key: string]: number | undefined;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  waveforms$: Observable<string[]>;
  waveform$: Observable<string>;
  attackTime$: Observable<number>;
  releaseTime$: Observable<number>;
  pianoNoteFreq: PianoNoteFrequency[] = pianoNotesFrequencies;
  chosenNoteFreq$: Observable<number>;
  activeNotes: { [frequency: number]: boolean } = {};
  public keyboardMap: KeyboardMapping = {
    'q': 261.63, '2': 277.18, 'w': 293.66, '3': 311.13, 'e': 329.63,
    'r': 349.23, '5': 369.99, 't': 392.00, '6': 415.30, 'y': 440.00,
    '7': 466.16, 'u': 493.88, 'i': 523.25,
    'z': 523.25, 's': 554.37, 'x': 587.33, 'd': 622.25, 'c': 659.25,
    'v': 698.46, 'g': 739.99, 'b': 783.99, 'h': 830.61, 'n': 880.00,
    'j': 932.33, 'm': 987.77, ',': 1046.50,
  };
  indicatorLines = [
    { color: 'white', top: '27%' },
    { color: '#b2b2b2', top: '40%' },
    { color: 'white', top: '54%' },
    { color: '#b2b2b2', top: '69%' },
    { color: 'white', top: '83%' }
  ];
  public pressedKeys: Set<string> = new Set();
  modulationIndex$: Observable<number>;
  harmonicityAmount$: Observable<number>;

  constructor(public waveformStore: WaveformStore, public audioService: AudioService) {
    this.waveforms$ = this.waveformStore.waveforms$;
    this.waveform$ = this.waveformStore.waveform$;
    this.attackTime$ = this.waveformStore.attackTime$;
    this.releaseTime$ = this.waveformStore.releaseTime$;
    this.chosenNoteFreq$ = this.waveformStore.chosenNoteFreq$;
    this.modulationIndex$ = this.waveformStore.modulationIndex$;
    this.harmonicityAmount$ = this.waveformStore.harmonicityAmount$;
  }

  startNote(frequency: number) {
    if (!this.activeNotes[frequency]) {
      this.activeNotes[frequency] = true;
      this.waveformStore.startOscillator(true, frequency);
      const keyElement = document.querySelector(`.key[data-frequency="${frequency}"]`);
      keyElement?.classList.add('active');
    }
  }

  stopNote(frequency: number) {
    if (this.activeNotes[frequency]) {
      delete this.activeNotes[frequency];
      this.waveformStore.stopOscillator(frequency);
      const keyElement = document.querySelector(`.key[data-frequency="${frequency}"]`);
      keyElement?.classList.remove('active');
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    if (this.pressedKeys.has(event.key)) {
      return;
    }
    this.pressedKeys.add(event.key);

    const frequency = this.keyboardMap[event.key.toLowerCase()];
    if (frequency) {
      this.startNote(frequency);
      const keyElements = document.querySelectorAll(`.key[data-frequency="${frequency}"]`);
      keyElements.forEach(keyElement => {
        keyElement?.classList.add('keyboard-active');
      });
    }
  }

  handleKeyUp(event: KeyboardEvent) {
    this.pressedKeys.delete(event.key);
    const frequency = this.keyboardMap[event.key.toLowerCase()];
    if (frequency) {
      this.stopNote(frequency);
      const keyElements = document.querySelectorAll(`.key[data-frequency="${frequency}"]`);
      keyElements.forEach(keyElement => {
        keyElement?.classList.remove('keyboard-active');
      });
    }
  }

  handleMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('key')) {
      const frequency = Number(target.dataset['frequency']);
      this.startNote(frequency);
    }
  }

  handleMouseUp(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('key')) {
      const frequency = Number(target.dataset['frequency']);
      this.stopNote(frequency);
    }
  }

  handleMouseLeave(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('key') && (event.buttons & 1)) {
      const frequency = Number(target.dataset['frequency']);
      this.stopNote(frequency);
    }
  }

  updateWaveform(selectedWaveform: string) {
    this.waveformStore.updateWaveform(selectedWaveform);
  }

  changeVolume(gain: string) {
    const volume = Number(gain);
    this.waveformStore.updateMasterVolume(volume);
  }
  updateAttackTime(attackTime: string) {
    this.waveformStore.updateAttackTime(Number(attackTime));
  }
  updateReleaseTime(releaseTime: string) {
    this.waveformStore.updateReleaseTime(Number(releaseTime));
  }
  updateVibratoAmount(vibratoAmount: string) {
    this.waveformStore.updateVibratoAmount(Number(vibratoAmount));
  }
  updateVibratoSpeed(vibratoSpeed: string) {
    this.waveformStore.updateVibratoSpeed(Number(vibratoSpeed));
  }
  updateDelayTime(delayTime: string) {
    this.waveformStore.updateDelayTime(Number(delayTime));
  }
  updateDelayFeedback(delayFeedback: string) {
    this.waveformStore.updateDelayFeedback(Number(delayFeedback));
  }
  updateDelayAmount(delayAmount: string) {
    this.waveformStore.updateDelayAmount(Number(delayAmount));
  }
  updateModulationIndex(modulationIndex: string) { // New method
    this.waveformStore.updateModulationIndex(Number(modulationIndex));
  }
  updateHarmonicityAmount(harmonicityAmount: string) {
    this.waveformStore.updateHarmonicityAmount(Number(harmonicityAmount));
  }
}
