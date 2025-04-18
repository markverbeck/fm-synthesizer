import { TestBed } from '@angular/core/testing';
import { AudioService } from '../services/audio.service';

describe('AudioService', () => {
  let service: AudioService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AudioService],
    });
    service = TestBed.inject(AudioService);
  });

  it('should create an oscillator with the correct waveform and frequency', () => {
    const waveform: OscillatorType = 'sine';
    const frequency = 440;

    const oscillator = service.createOscillator(waveform, frequency);

    expect(oscillator.type).toBe(waveform);
    expect(oscillator.frequency.value).toBe(frequency);
  });

  it('should create a gain node', () => {
    const gainNode = service.createGainNode();

    expect(gainNode).toBeTruthy();
    expect(gainNode.gain.value).toBe(1); // Default gain value
  });

  it('should connect vibrato to an oscillator', () => {
    const oscillator = service.createOscillator('sine', 440);
    const vibratoAmount = 5;
    const vibratoSpeed = 10;

    // Mock the LFO oscillator
    const mockLfoOscillator = {
      frequency: { setValueAtTime: jasmine.createSpy('setValueAtTime') },
      connect: jasmine.createSpy('connect'),
      start: jasmine.createSpy('start'),
      type: 'sine',
    } as unknown as OscillatorNode;

    // Mock the LFO gain node with a loosely typed connect method
    const mockLfoGain = {
      gain: { setValueAtTime: jasmine.createSpy('setValueAtTime') },
      connect: jasmine.createSpy('connect') as any, // Use `any` to bypass type checking
    } as unknown as any;

    // Spy on the AudioContext methods to return the mocked objects
    spyOn(service.audioContext, 'createOscillator').and.returnValue(mockLfoOscillator);
    spyOn(service.audioContext, 'createGain').and.returnValue(mockLfoGain);

    // Call the method under test
    service.connectVibrato(oscillator, vibratoAmount, vibratoSpeed);

    // Assertions
    expect(mockLfoOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(vibratoSpeed, service.audioContext.currentTime);
    expect(mockLfoGain.gain.setValueAtTime).toHaveBeenCalledWith(vibratoAmount, service.audioContext.currentTime);
    expect(mockLfoOscillator.start).toHaveBeenCalledWith(service.audioContext.currentTime);
    expect(mockLfoOscillator.connect).toHaveBeenCalledWith(mockLfoGain);
    expect(mockLfoGain.connect).toHaveBeenCalledWith(oscillator.frequency); // No explicit cast needed
  });

  it('should connect delay to a source node', () => {
    const gainNode = service.createGainNode();
    const delayTime = 0.5;
    const delayFeedback = 0.3;
    const delayAmount = 0.7;

    spyOn(gainNode, 'connect');
    service.connectDelay(gainNode, delayTime, delayFeedback, delayAmount);

    expect(gainNode.connect).toHaveBeenCalled();
  });

  it('should set the master volume', () => {
    const volume = 0.5;

    service.setMasterVolume(volume);

    expect(service.masterVolume.gain.value).toBe(volume);
  });

  it('should return the master volume node', () => {
    const masterVolume = service.getMasterVolume();

    expect(masterVolume).toBe(service.masterVolume);
  });

  it('should return the audio context', () => {
    const audioContext = service.getAudioContext();

    expect(audioContext).toBe(service.audioContext);
  });
});
