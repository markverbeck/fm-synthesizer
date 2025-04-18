import { Injectable } from '@angular/core';

interface ActiveNoteNodes {
  oscillator: OscillatorNode;
  gain: GainNode;
}

@Injectable({ providedIn: 'root' })
export class AudioService {
  public audioContext: AudioContext;
  public masterVolume: GainNode;
  public activeNoteNodes: { [frequency: number]: ActiveNoteNodes } = {};

  constructor() {
    this.audioContext = new AudioContext();
    this.masterVolume = this.audioContext.createGain();
    this.masterVolume.gain.value = 0.1;
    this.masterVolume.connect(this.audioContext.destination);
  }

  createOscillator(waveform: OscillatorType, frequency: number): OscillatorNode {
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    return oscillator;
  }

  createGainNode(): GainNode {
    return this.audioContext.createGain();
  }

  connectVibrato(oscillator: OscillatorNode, vibratoAmount: number, vibratoSpeed: number): void {
    const lfoOscillator = this.audioContext.createOscillator();
    lfoOscillator.type = 'sine'; // Be explicit about the waveform
    lfoOscillator.frequency.setValueAtTime(vibratoSpeed, this.audioContext.currentTime);
    lfoOscillator.start(this.audioContext.currentTime); // Start at the current time

    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.setValueAtTime(vibratoAmount, this.audioContext.currentTime);

    lfoOscillator.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
  }

  connectDelay(source: GainNode, delayTime: number, delayFeedback: number, delayAmount: number): void {
    const delay = this.audioContext.createDelay(5.0); // Increased max delay time
    const feedback = this.audioContext.createGain();
    const delayAmountGain = this.audioContext.createGain();

    delay.delayTime.value = delayTime;
    feedback.gain.value = delayFeedback;
    delayAmountGain.gain.value = delayAmount;

    source.connect(delay);
    delay.connect(delayAmountGain);
    delayAmountGain.connect(this.masterVolume);
    delayAmountGain.connect(feedback);
    feedback.connect(delay);
  }

  startNote(
    waveform: OscillatorType,
    attackTime: number,
    sustainLevel: number,
    releaseTime: number,
    vibratoAmount: number,
    vibratoSpeed: number,
    delayTime: number,
    delayFeedback: number,
    delayAmount: number,
    frequency: number
  ): ActiveNoteNodes | undefined {
    if (this.activeNoteNodes[frequency]) {
      this.stopNote(frequency); // Stop any existing note with the same frequency
    }

    const oscillator = this.createOscillator(waveform, frequency);
    const gainNode = this.createGainNode();

    this.connectVibrato(oscillator, vibratoAmount, vibratoSpeed);
    this.connectDelay(gainNode, delayTime, delayFeedback, delayAmount);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(sustainLevel, this.audioContext.currentTime + attackTime);
    gainNode.gain.setValueAtTime(sustainLevel, this.audioContext.currentTime + attackTime + 0.01);

    if (releaseTime !== Infinity) {
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + attackTime + 0.01 + releaseTime);
      oscillator.stop(this.audioContext.currentTime + attackTime + 0.01 + releaseTime);
    }

    oscillator.connect(gainNode);
    gainNode.connect(this.masterVolume);
    oscillator.start();

    this.activeNoteNodes[frequency] = { oscillator, gain: gainNode };
    return this.activeNoteNodes[frequency];
  }

  stopNote(frequency: number, releaseTime?: number) {
    if (this.activeNoteNodes[frequency]) {
      const { oscillator, gain } = this.activeNoteNodes[frequency];
      const currentTime = this.audioContext.currentTime;
      gain.gain.cancelScheduledValues(currentTime);

      const actualReleaseTime = releaseTime !== undefined ? releaseTime : 0.1; // Default release time
      const stopTime = currentTime + actualReleaseTime;

      gain.gain.linearRampToValueAtTime(gain.gain.value, currentTime + 0.01);
      gain.gain.linearRampToValueAtTime(0, stopTime);
      oscillator.stop(stopTime);

      // Disconnect and remove from active nodes AFTER the stop is scheduled
      setTimeout(() => {
        oscillator.disconnect();
        gain.disconnect();
        delete this.activeNoteNodes[frequency];
      }, (actualReleaseTime + 0.05) * 1000); // Add a small buffer
    }
  }

  setMasterVolume(value: number) {
    this.masterVolume.gain.value = value;
  }

  getMasterVolume(): GainNode {
    return this.masterVolume;
  }

  getAudioContext(): AudioContext {
    return this.audioContext;
  }
}
