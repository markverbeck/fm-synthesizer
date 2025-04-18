import { TestBed } from '@angular/core/testing';
import { WaveformStore } from '../store/waveform/waveform.store';
import { AudioService } from '../services/audio.service';
import { Store } from '@ngrx/store';
import * as actions from '../store/waveform/waveform.actions';
import { of } from 'rxjs';

describe('WaveformStore', () => {
  let store: WaveformStore;
  let audioServiceMock: jasmine.SpyObj<AudioService>;
  let storeMock: jasmine.SpyObj<Store>;

  beforeEach(() => {
    audioServiceMock = jasmine.createSpyObj('AudioService', ['setMasterVolume']);
    storeMock = jasmine.createSpyObj('Store', ['dispatch', 'select']);
    storeMock.select.and.returnValue(of(null)); // Mock the select method to return an observable

    TestBed.configureTestingModule({
      providers: [
        WaveformStore,
        { provide: AudioService, useValue: audioServiceMock },
        { provide: Store, useValue: storeMock },
      ],
    });

    store = TestBed.inject(WaveformStore);
  });

  it('should update the master volume', () => {
    const volume = 0.8;
    store.updateMasterVolume(volume);

    expect(audioServiceMock.setMasterVolume).toHaveBeenCalledWith(volume);
  });

  it('should dispatch updateWaveform action', () => {
    const waveform = 'sine';
    store.updateWaveform(waveform);

    expect(storeMock.dispatch).toHaveBeenCalledWith(actions.updateWaveform({ waveform }));
  });

  it('should dispatch updateAttackTime action', () => {
    const attackTime = 0.5;
    store.updateAttackTime(attackTime);

    expect(storeMock.dispatch).toHaveBeenCalledWith(actions.updateAttackTime({ attackTime }));
  });

  it('should dispatch updateReleaseTime action', () => {
    const releaseTime = 0.3;
    store.updateReleaseTime(releaseTime);

    expect(storeMock.dispatch).toHaveBeenCalledWith(actions.updateReleaseTime({ releaseTime }));
  });

  it('should dispatch updateVibratoAmount action', () => {
    const vibratoAmount = 0.7;
    store.updateVibratoAmount(vibratoAmount);

    expect(storeMock.dispatch).toHaveBeenCalledWith(actions.updateVibratoAmount({ vibratoAmount }));
  });

  it('should dispatch updateVibratoSpeed action', () => {
    const vibratoSpeed = 5.0;
    store.updateVibratoSpeed(vibratoSpeed);

    expect(storeMock.dispatch).toHaveBeenCalledWith(actions.updateVibratoSpeed({ vibratoSpeed }));
  });

  it('should dispatch updateDelayTime action', () => {
    const delayTime = 0.4;
    store.updateDelayTime(delayTime);

    expect(storeMock.dispatch).toHaveBeenCalledWith(actions.updateDelayTime({ delayTime }));
  });

  it('should dispatch updateDelayFeedback action', () => {
    const delayFeedback = 0.6;
    store.updateDelayFeedback(delayFeedback);

    expect(storeMock.dispatch).toHaveBeenCalledWith(actions.updateDelayFeedback({ delayFeedback }));
  });

  it('should dispatch updateDelayAmount action', () => {
    const delayAmount = 0.5;
    store.updateDelayAmount(delayAmount);

    expect(storeMock.dispatch).toHaveBeenCalledWith(actions.updateDelayAmount({ delayAmount }));
  });

  it('should dispatch updateChosenNoteFreq action', () => {
    const chosenNoteFreq = 440;
    store.updateChosenNoteFreq(chosenNoteFreq);

    expect(storeMock.dispatch).toHaveBeenCalledWith(actions.updateChosenNoteFreq({ chosenNoteFreq }));
  });

  it('should dispatch updateModulationIndex action', () => {
    const modulationIndex = 2.0;
    store.updateModulationIndex(modulationIndex);

    expect(storeMock.dispatch).toHaveBeenCalledWith(actions.updateModulationIndex({ modulationIndex }));
  });

  it('should dispatch updateHarmonicityAmount action', () => {
    const harmonicityAmount = 1.5;
    store.updateHarmonicityAmount(harmonicityAmount);

    expect(storeMock.dispatch).toHaveBeenCalledWith(actions.updateHarmonicityAmount({ harmonicityAmount }));
  });
});
