// waveform.reducer.ts
import { createReducer, on } from '@ngrx/store';
import * as actions from './waveform.actions';
import { initialState, WaveformState } from './waveform.state';


export const waveformReducer = createReducer(
  initialState,
  on(actions.updateWaveform, (state, { waveform }) => ({ ...state, waveform })),
  on(actions.updateAttackTime, (state, { attackTime }) => ({ ...state, attackTime })),
  on(actions.updateReleaseTime, (state, { releaseTime }) => ({ ...state, releaseTime })),
  on(actions.updateSustainLevel, (state, { sustainLevel }) => ({ ...state, sustainLevel })),
  on(actions.updateVibratoAmount, (state, { vibratoAmount }) => ({ ...state, vibratoAmount })),
  on(actions.updateVibratoSpeed, (state, { vibratoSpeed }) => ({ ...state, vibratoSpeed })),
  on(actions.updateDelayTime, (state, { delayTime }) => ({ ...state, delayTime })),
  on(actions.updateDelayFeedback, (state, { delayFeedback }) => ({ ...state, delayFeedback })),
  on(actions.updateDelayAmount, (state, { delayAmount }) => ({ ...state, delayAmount })),
  on(actions.updateChosenNoteFreq, (state, { chosenNoteFreq }) => ({ ...state, chosenNoteFreq })),
  on(actions.updateModulationIndex, (state, { modulationIndex }) => ({ ...state, modulationIndex })),
  on(actions.updateHarmonicityAmount, (state, { harmonicityAmount }) => ({ ...state, harmonicityAmount }))
);

export function reducer(state: WaveformState | undefined, action: any) {
  return waveformReducer(state, action);
}
