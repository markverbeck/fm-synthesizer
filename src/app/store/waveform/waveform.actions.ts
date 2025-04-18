// waveform.actions.ts
import { createAction, props } from '@ngrx/store';

export const updateWaveform = createAction('[Waveform] Update Waveform', props<{ waveform: string }>());
export const updateAttackTime = createAction('[Envelope] Update Attack Time', props<{ attackTime: number }>());
export const updateReleaseTime = createAction('[Envelope] Update Release Time', props<{ releaseTime: number }>());
export const updateSustainLevel = createAction('[Envelope] Update Sustain Level', props<{ sustainLevel: number }>());
export const updateVibratoAmount = createAction('[Vibrato] Update Vibrato Amount', props<{ vibratoAmount: number }>());
export const updateVibratoSpeed = createAction('[Vibrato] Update Vibrato Speed', props<{ vibratoSpeed: number }>());
export const updateDelayTime = createAction('[Delay] Update Delay Time', props<{ delayTime: number }>());
export const updateDelayFeedback = createAction('[Delay] Update Delay Feedback', props<{ delayFeedback: number }>());
export const updateDelayAmount = createAction('[Delay] Update Delay Amount', props<{ delayAmount: number }>());
export const updateChosenNoteFreq = createAction('[Keyboard] Update Chosen Note Frequency', props<{ chosenNoteFreq: number }>());
export const updateModulationIndex = createAction('[FM] Update Modulation Index', props<{ modulationIndex: number }>());
export const updateHarmonicityAmount = createAction('[FM] Update Harmonicity', props<{ harmonicityAmount: number }>()); // New action
