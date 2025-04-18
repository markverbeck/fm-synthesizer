import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { WaveformStore } from '../store/waveform/waveform.store';
import { AudioService } from '../services/audio.service';
import { Store } from '@ngrx/store';
import * as selectors from '../store/waveform/waveform.selectors';

describe('WaveformStore - stopOscillator', () => {
  let store: WaveformStore;
  let audioServiceMock: jasmine.SpyObj<AudioService>;
  let storeMock: Partial<Store>;
  let mockCurrentTime: number;

  beforeEach(() => {
    mockCurrentTime = 0;

    audioServiceMock = jasmine.createSpyObj('AudioService', ['createOscillator', 'createGainNode']);
    Object.defineProperty(audioServiceMock, 'audioContext', {
      value: {
        get currentTime() {
          return mockCurrentTime; // Use a getter to simulate currentTime
        },
      },
    });

    storeMock = {
      select: jasmine.createSpy().and.callFake((selector: any) => {
      if (selector === selectors.selectReleaseTime) {
        return of(0.1); // Mock release time
      }
      return of(null); // Default mock for other selectors
    }),
};

    TestBed.configureTestingModule({
      providers: [
        WaveformStore,
        { provide: AudioService, useValue: audioServiceMock },
        { provide: Store, useValue: storeMock },
      ],
    });

    store = TestBed.inject(WaveformStore);

    // Reset activeOscillators before each test
    store['activeOscillators'] = {};
  });

  it('should stop and disconnect the oscillator and gain node for a given frequency', fakeAsync(() => {
    const mockOscillator = jasmine.createSpyObj('OscillatorNode', ['stop', 'disconnect']);
    const mockGainNode = jasmine.createSpyObj('GainNode', ['disconnect'], {
      gain: jasmine.createSpyObj('AudioParam', ['cancelScheduledValues', 'linearRampToValueAtTime'], { value: 0.5 }),
    });
    const frequency = 440;
    store['activeOscillators'][frequency] = { oscillator: mockOscillator, gainNode: mockGainNode };

    store.stopOscillator(frequency);
    tick(); // Wait for the observable to complete

    // Verify the release time selector was called
    expect(storeMock.select).toHaveBeenCalledWith(selectors.selectReleaseTime);

    // Verify gainNode.gain methods
    expect(mockGainNode.gain.cancelScheduledValues).toHaveBeenCalledWith(0);
    expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.5, 0.01); // First call
    expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, 0.1); // Second call

    // Verify oscillator methods
    expect(mockOscillator.stop).toHaveBeenCalledWith(0.1);
    expect(mockOscillator.disconnect).toHaveBeenCalled();

    // Verify gainNode disconnection
    expect(mockGainNode.disconnect).toHaveBeenCalled();

    // Verify cleanup
    expect(store['activeOscillators'][frequency]).toBeUndefined();
  }));

  it('should use the current time from the audio context', fakeAsync(() => {
    const mockOscillator = jasmine.createSpyObj('OscillatorNode', ['stop', 'disconnect']);
    const mockGainNode = jasmine.createSpyObj('GainNode', ['disconnect'], {
      gain: jasmine.createSpyObj('AudioParam', ['cancelScheduledValues', 'linearRampToValueAtTime'], { value: 0.5 }),
    });
    const frequency = 440;
    store['activeOscillators'][frequency] = { oscillator: mockOscillator, gainNode: mockGainNode };

    // Simulate the current time
    mockCurrentTime = 1.0;

    store.stopOscillator(frequency);
    tick();

    expect(mockGainNode.gain.cancelScheduledValues).toHaveBeenCalledWith(1.0);
    expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.5, 1.01);
    expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, 1.1);
    expect(mockOscillator.stop).toHaveBeenCalledWith(1.1);
  }));
});
