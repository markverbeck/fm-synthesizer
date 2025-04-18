export interface WaveformState {
  waveforms: string[];
  waveform: string;
  attackTime: number;
  releaseTime: number;
  sustainLevel: number;
  vibratoAmount: number;
  vibratoSpeed: number;
  delayTime: number;
  delayFeedback: number;
  delayAmount: number;
  chosenNoteFreq: number;
  modulationIndex: number;
  harmonicityAmount: number;
}

export const initialState: WaveformState = {
  waveforms: ['sine', 'square', 'sawtooth', 'triangle'],
  waveform: 'sine',
  attackTime: 0.1,
  releaseTime: 0.5,
  sustainLevel: 0.7,
  vibratoAmount: 5,
  vibratoSpeed: 5,
  delayTime: 0.2,
  delayFeedback: 0.3,
  delayAmount: 0.2,
  chosenNoteFreq: 440,
  modulationIndex: 0,
  harmonicityAmount: 1,
};
