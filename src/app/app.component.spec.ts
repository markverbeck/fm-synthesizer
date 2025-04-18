import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { WaveformStore } from './store/waveform/waveform.store';
import { AudioService } from './services/audio.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let waveformStoreMock: jasmine.SpyObj<WaveformStore>;
  let audioServiceMock: jasmine.SpyObj<AudioService>;

  beforeEach(() => {
    waveformStoreMock = jasmine.createSpyObj('WaveformStore', [
      'startOscillator',
      'stopOscillator',
      'updateWaveform',
      'updateMasterVolume',
      'updateAttackTime',
      'updateReleaseTime',
      'updateVibratoAmount',
      'updateVibratoSpeed',
      'updateDelayTime',
      'updateDelayFeedback',
      'updateDelayAmount',
      'updateModulationIndex',
      'updateHarmonicityAmount',
    ]);

    audioServiceMock = jasmine.createSpyObj('AudioService', ['setMasterVolume']);

    TestBed.configureTestingModule({
      imports: [AppComponent], // Add AppComponent to imports instead of declarations
      providers: [
        { provide: WaveformStore, useValue: waveformStoreMock },
        { provide: AudioService, useValue: audioServiceMock },
      ],
    });

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should start a note and add the active class to the key element', () => {
    const frequency = 440;
    const mockKeyElement = document.createElement('div');
    mockKeyElement.classList.add('key');
    mockKeyElement.dataset['frequency'] = frequency.toString();
    document.body.appendChild(mockKeyElement);

    component.startNote(frequency);

    expect(component.activeNotes[frequency]).toBeTrue();
    expect(waveformStoreMock.startOscillator).toHaveBeenCalledWith(true, frequency);

    // Query the DOM for the element after startNote is called
    const foundElement = document.querySelector(`.key[data-frequency="${frequency}"]`);
    expect(foundElement?.classList.contains('active')).toBeTrue();

    document.body.removeChild(mockKeyElement);
  });

  it('should stop a note and remove the active class from the key element', () => {
    const frequency = 440;
    const mockKeyElement = document.createElement('div');
    mockKeyElement.classList.add('key', 'active');
    mockKeyElement.dataset['frequency'] = frequency.toString();
    document.body.appendChild(mockKeyElement);

    component.activeNotes[frequency] = true;
    component.stopNote(frequency);

    expect(component.activeNotes[frequency]).toBeUndefined();
    expect(waveformStoreMock.stopOscillator).toHaveBeenCalledWith(frequency);

    // Query the DOM for the element after stopNote is called
    const foundElement = document.querySelector(`.key[data-frequency="${frequency}"]`);
    expect(foundElement?.classList.contains('active')).toBeFalse();

    document.body.removeChild(mockKeyElement);
  });

  it('should handle mousedown events and start a note', () => {
    const frequency = 440;
    const mockKeyElement = document.createElement('div');
    mockKeyElement.classList.add('key');
    mockKeyElement.dataset['frequency'] = frequency.toString();
    document.body.appendChild(mockKeyElement);

    const event = new MouseEvent('mousedown', { bubbles: true });
    Object.defineProperty(event, 'target', { value: mockKeyElement });

    component.handleMouseDown(event);

    expect(component.activeNotes[frequency]).toBeTrue();
    expect(waveformStoreMock.startOscillator).toHaveBeenCalledWith(true, frequency);

    document.body.removeChild(mockKeyElement);
  });

  it('should handle mouseup events and stop a note', () => {
    const frequency = 440;
    const mockKeyElement = document.createElement('div');
    mockKeyElement.classList.add('key');
    mockKeyElement.dataset['frequency'] = frequency.toString();
    document.body.appendChild(mockKeyElement);

    component.activeNotes[frequency] = true;

    const event = new MouseEvent('mouseup', { bubbles: true });
    Object.defineProperty(event, 'target', { value: mockKeyElement });

    component.handleMouseUp(event);

    expect(component.activeNotes[frequency]).toBeUndefined();
    expect(waveformStoreMock.stopOscillator).toHaveBeenCalledWith(frequency);

    document.body.removeChild(mockKeyElement);
  });

  it('should handle mouseleave events and stop a note if the left mouse button is pressed', () => {
    const frequency = 440;
    const mockKeyElement = document.createElement('div');
    mockKeyElement.classList.add('key');
    mockKeyElement.dataset['frequency'] = frequency.toString();
    document.body.appendChild(mockKeyElement);

    component.activeNotes[frequency] = true;

    const event = new MouseEvent('mouseleave', { bubbles: true, buttons: 1 });
    Object.defineProperty(event, 'target', { value: mockKeyElement });

    component.handleMouseLeave(event);

    expect(component.activeNotes[frequency]).toBeUndefined();
    expect(waveformStoreMock.stopOscillator).toHaveBeenCalledWith(frequency);

    document.body.removeChild(mockKeyElement);
  });
});
