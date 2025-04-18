import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { WaveformStore } from '../store/waveform/waveform.store';
import { AudioService } from '../services/audio.service';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

describe('WaveformStore', () => {
  let store: WaveformStore;
  let audioServiceMock: jasmine.SpyObj<AudioService>;
  let storeMock: jasmine.SpyObj<Store>;

  beforeEach(() => {
    audioServiceMock = jasmine.createSpyObj('AudioService', [
      'createOscillator',
      'createGainNode',
      'connectVibrato',
      'connectDelay',
    ]);

    // Mock the audioContext with a currentTime property
    audioServiceMock.audioContext = {
      currentTime: 0,
    } as unknown as AudioContext;

    storeMock = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    storeMock.select.and.returnValue(of()); // Mock store selectors to return observables

    TestBed.configureTestingModule({
      providers: [
        WaveformStore,
        { provide: AudioService, useValue: audioServiceMock },
        { provide: Store, useValue: storeMock },
      ],
    });

    store = TestBed.inject(WaveformStore);

    // Mock observables
    store.waveform$ = of('sine');
    store.attackTime$ = of(0.5);
    store.sustainLevel$ = of(0.8);
    store.releaseTime$ = of(0.3);
    store.vibratoAmount$ = of(0.2);
    store.vibratoSpeed$ = of(5);
    store.delayTime$ = of(0.4);
    store.delayFeedback$ = of(0.5);
    store.delayAmount$ = of(0.3);
    store.modulationIndex$ = of(1); // Ensure modulationIndex > 0 to test FM modulation
    store.harmonicityAmount$ = of(1.5);
  });

  it('should start an oscillator with the correct configuration', fakeAsync(() => {
    const mockOscillator = jasmine.createSpyObj('OscillatorNode', ['connect', 'start', 'stop']);
    const mockGainNode = jasmine.createSpyObj('GainNode', ['connect'], {
      gain: jasmine.createSpyObj('AudioParam', ['setValueAtTime', 'linearRampToValueAtTime']),
    });

    audioServiceMock.createOscillator.and.returnValue(mockOscillator);
    audioServiceMock.createGainNode.and.returnValue(mockGainNode);

    store.startOscillator(false, 440);

    // Simulate the passage of time to allow the subscription to complete
    tick();

    expect(audioServiceMock.createOscillator).toHaveBeenCalledWith('sine', 440);
    expect(audioServiceMock.createGainNode).toHaveBeenCalled();
    expect(audioServiceMock.connectVibrato).toHaveBeenCalledWith(mockOscillator, 0.2, 5);
    expect(audioServiceMock.connectDelay).toHaveBeenCalledWith(mockGainNode, 0.4, 0.5, 0.3);
    expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0, jasmine.any(Number));
    expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.8, jasmine.any(Number));
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(store['activeOscillators'][440]).toBeDefined();
  }));

  it('should not start an oscillator if one is already active at the given frequency', () => {
    store['activeOscillators'][440] = { oscillator: {} as OscillatorNode, gainNode: {} as GainNode };

    store.startOscillator(false, 440);

    expect(audioServiceMock.createOscillator).not.toHaveBeenCalled();
  });
});
