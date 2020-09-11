import {observable, action, reaction} from "mobx";

export class AudioPlayerStore {
    @observable
    currentTrackId?: string = undefined;

    @observable
    volume: number = 1;

    @observable
    playing: boolean = false;

    @observable
    currentPosition: number = 0;

    constructor() {
        reaction(
            () => this.currentTrackId,
            () => this.currentPosition = 0
        );
    }

    @action
    setCurrentTrackId = (currentTrackId?: string): void => {
        this.currentTrackId = currentTrackId;
    };

    @action
    setVolume = (volume: number): void => {
        this.volume = volume;
    };

    @action
    setPlaying = (playing: boolean): void => {
        this.playing = playing;
    };

    @observable
    setCurrentPosition = (currentPosition: number): void => {
        this.currentPosition = currentPosition;
    };
}
