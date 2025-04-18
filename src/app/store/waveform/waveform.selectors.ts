// waveform.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WaveformState } from './waveform.state'; // Assuming you have a reducer

export const selectWaveformState = createFeatureSelector<WaveformState>('waveform'); // Adjust feature selector name

export const selectWaveforms = createSelector(selectWaveformState, (state) => state.waveforms);
export const selectWaveform = createSelector(selectWaveformState, (state) => state.waveform);
export const selectAttackTime = createSelector(selectWaveformState, (state) => state.attackTime);
export const selectReleaseTime = createSelector(selectWaveformState, (state) => state.releaseTime);
export const selectSustainLevel = createSelector(selectWaveformState, (state) => state.sustainLevel);
export const selectVibratoAmount = createSelector(selectWaveformState, (state) => state.vibratoAmount);
export const selectVibratoSpeed = createSelector(selectWaveformState, (state) => state.vibratoSpeed);
export const selectDelayTime = createSelector(selectWaveformState, (state) => state.delayTime);
export const selectDelayFeedback = createSelector(selectWaveformState, (state) => state.delayFeedback);
export const selectDelayAmount = createSelector(selectWaveformState, (state) => state.delayAmount);
export const selectChosenNoteFreq = createSelector(selectWaveformState, (state) => state.chosenNoteFreq);
export const selectModulationIndex = createSelector(selectWaveformState, (state) => state.modulationIndex);
export const selectHarmonicityAmount = createSelector(selectWaveformState, (state) => state.harmonicityAmount)
