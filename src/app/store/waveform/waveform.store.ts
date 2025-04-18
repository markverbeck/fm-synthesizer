// waveform.store.ts
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
import { AudioService } from '../../services/audio.service';
import * as actions from './waveform.actions';
import * as selectors from './waveform.selectors';

interface ActiveOscillator {
  oscillator: OscillatorNode;
  gainNode: GainNode;
  modulatingOscillator?: OscillatorNode; // Optional: Store the modulator
  modulationGain?: GainNode;           // Optional: Store the modulation gain
}

@Injectable({ providedIn: 'root' })
export class WaveformStore {
  public waveforms$: Observable<string[]>;
  public waveform$: Observable<string>;
  public attackTime$: Observable<number>;
  public releaseTime$: Observable<number>;
  public sustainLevel$: Observable<number>;
  public vibratoAmount$: Observable<number>;
  public vibratoSpeed$: Observable<number>;
  public delayTime$: Observable<number>;
  public delayFeedback$: Observable<number>;
  public delayAmount$: Observable<number>;
  public chosenNoteFreq$: Observable<number>;
  public modulationIndex$: Observable<number>;
  public harmonicityAmount$: Observable<number>;

  private activeOscillators: { [frequency: string]: { oscillator: OscillatorNode; gainNode: GainNode; modulatingOscillator?: OscillatorNode, modulationGain?: GainNode; } } = {};
;

  constructor(private _store: Store, private audioService: AudioService) {
    this.waveforms$ = this._store.select(selectors.selectWaveforms);
    this.waveform$ = this._store.select(selectors.selectWaveform);
    this.attackTime$ = this._store.select(selectors.selectAttackTime);
    this.releaseTime$ = this._store.select(selectors.selectReleaseTime);
    this.sustainLevel$ = this._store.select(selectors.selectSustainLevel);
    this.vibratoAmount$ = this._store.select(selectors.selectVibratoAmount);
    this.vibratoSpeed$ = this._store.select(selectors.selectVibratoSpeed);
    this.delayTime$ = this._store.select(selectors.selectDelayTime);
    this.delayFeedback$ = this._store.select(selectors.selectDelayFeedback);
    this.delayAmount$ = this._store.select(selectors.selectDelayAmount);
    this.chosenNoteFreq$ = this._store.select(selectors.selectChosenNoteFreq);
    this.modulationIndex$ = this._store.select(selectors.selectModulationIndex);
    this.harmonicityAmount$ = this._store.select(selectors.selectHarmonicityAmount);
  }

  startOscillator(sustain: boolean = false, frequency?: number) {
  if (frequency && !this.activeOscillators[frequency]) {
    combineLatest([
      this.waveform$.pipe(take(1)),
      this.attackTime$.pipe(take(1)),
      this.sustainLevel$.pipe(take(1)),
      this.releaseTime$.pipe(take(1)),
      this.vibratoAmount$.pipe(take(1)),
      this.vibratoSpeed$.pipe(take(1)),
      this.delayTime$.pipe(take(1)),
      this.delayFeedback$.pipe(take(1)),
      this.delayAmount$.pipe(take(1)),
      this.modulationIndex$.pipe(take(1)),
      this.harmonicityAmount$.pipe(take(1)),
    ]).subscribe(([waveform, attackTime, sustainLevel, releaseTime, vibratoAmount, vibratoSpeed, delayTime, delayFeedback, delayAmount, modulationIndex, harmonicityAmount]) => {
      let oscillator: OscillatorNode;
      let gainNode: GainNode;
      let modulatingOscillator: OscillatorNode | undefined;
      let modulationGain: GainNode | undefined;

      // Create the carrier oscillator *regardless* of the waveform
      const carrier = this.audioService.createOscillator(
        waveform as OscillatorType, // Use the selected waveform
        frequency
      );

      if (modulationIndex > 0) {
        const modulatingFrequency = frequency * harmonicityAmount; // Only apply FM if modulationIndex is greater than 0
        modulatingOscillator = this.audioService.createOscillator('sine', modulatingFrequency); // Modulating frequency (can be a parameter)
        modulationGain = this.audioService.createGainNode();
        modulationGain.gain.setValueAtTime(modulationIndex * frequency, this.audioService.audioContext.currentTime);

        modulatingOscillator.connect(modulationGain);
        modulationGain.connect(carrier.frequency);
        oscillator = carrier; // The carrier is now the main oscillator
      } else {
        oscillator = carrier; // If no modulation, the carrier is still the main oscillator
      }

      gainNode = this.audioService.createGainNode();

      this.audioService.connectVibrato(oscillator, vibratoAmount, vibratoSpeed);
      this.audioService.connectDelay(gainNode, delayTime, delayFeedback, delayAmount);

      gainNode.gain.setValueAtTime(0, this.audioService.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(sustainLevel, this.audioService.audioContext.currentTime + attackTime);
      gainNode.gain.setValueAtTime(sustainLevel, this.audioService.audioContext.currentTime + attackTime + 0.01);

      if (!sustain) {
        gainNode.gain.linearRampToValueAtTime(0, this.audioService.audioContext.currentTime + attackTime + 0.01 + releaseTime);
        oscillator.stop(this.audioService.audioContext.currentTime + attackTime + 0.01 + releaseTime);
        if (modulatingOscillator) {
          modulatingOscillator.stop(this.audioService.audioContext.currentTime + attackTime + 0.01 + releaseTime);
        }
      }

      oscillator.connect(gainNode);
      gainNode.connect(this.audioService.masterVolume);
      oscillator.start();
      if (modulatingOscillator) {
        modulatingOscillator.start();
      }

      this.activeOscillators[frequency] = { oscillator, gainNode, modulatingOscillator, modulationGain };
    });
  }
}

 stopOscillator(frequency?: number) {
  if (!frequency || !this.activeOscillators[frequency]) {
    return; // Exit early if no oscillator is active for the given frequency
  }

  const { oscillator, gainNode, modulatingOscillator } = this.activeOscillators[frequency];
  const releaseTime$ = this._store.select(selectors.selectReleaseTime).pipe(take(1));
  releaseTime$.subscribe(time => {
    const currentTime = this.audioService.audioContext.currentTime;
    gainNode.gain.cancelScheduledValues(currentTime);
    gainNode.gain.linearRampToValueAtTime(gainNode.gain.value, currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, currentTime + time);
    oscillator.stop(currentTime + time);
    oscillator.disconnect();
    gainNode.disconnect();
    if (modulatingOscillator) {
      modulatingOscillator.stop(currentTime + time);
      modulatingOscillator.disconnect();
    }
    delete this.activeOscillators[frequency];
  });
}

  updateMasterVolume(volume: number) {
    this.audioService.setMasterVolume(volume);
  }
  updateWaveform(waveform: string) {
    this._store.dispatch(actions.updateWaveform({ waveform }));
  }
  updateAttackTime(attackTime: number) {
    this._store.dispatch(actions.updateAttackTime({ attackTime }));
  }
  updateReleaseTime(releaseTime: number) {
    this._store.dispatch(actions.updateReleaseTime({ releaseTime }));
  }
  updateVibratoAmount(vibratoAmount: number) {
    this._store.dispatch(actions.updateVibratoAmount({ vibratoAmount }));
  }
  updateVibratoSpeed(vibratoSpeed: number) {
    this._store.dispatch(actions.updateVibratoSpeed({ vibratoSpeed }));
  }
  updateDelayTime(delayTime: number) {
    this._store.dispatch(actions.updateDelayTime({ delayTime }));
  }
  updateDelayFeedback(delayFeedback: number) {
    this._store.dispatch(actions.updateDelayFeedback({ delayFeedback }));
  }
  updateDelayAmount(delayAmount: number) {
    this._store.dispatch(actions.updateDelayAmount({ delayAmount }));
  }
  updateChosenNoteFreq(chosenNoteFreq: number) {
    this._store.dispatch(actions.updateChosenNoteFreq({ chosenNoteFreq }));
  }
  updateModulationIndex(modulationIndex: number) { // New action dispatch
    this._store.dispatch(actions.updateModulationIndex({ modulationIndex }));
  }
  updateHarmonicityAmount(harmonicityAmount: number) {
        this._store.dispatch(actions.updateHarmonicityAmount({ harmonicityAmount })); // New action dispatch
  }
}
