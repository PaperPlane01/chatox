import {makeAutoObservable, reaction} from "mobx";
import {UploadType} from "../../api/types/response";
import {AudioType} from "../types";

export class AudioPlayerStore {
    currentTrackId?: string = undefined;

    currentTrackType?: AudioType = undefined;

    volume: number = 1;

    playing: boolean = false;

    currentPosition: number = 0;

    seekTo: number | undefined = undefined;

    constructor() {
        makeAutoObservable(this);

        reaction(
            () => this.currentTrackId,
            () => this.setCurrentPosition(0)
        );
    }

    setCurrentTrackId = (currentTrackId?: string): void => {
        this.currentTrackId = currentTrackId;
    }

    setCurrentTrackType = (currentTrackType?: AudioType): void => {
        this.currentTrackType = currentTrackType;
    }

    setVolume = (volume: number): void => {
        this.volume = volume;
    }

    setPlaying = (playing: boolean): void => {
        this.playing = playing;
    }

    setCurrentPosition = (currentPosition: number): void => {
        if (currentPosition !== 1) {
            this.currentPosition = currentPosition;
        }
    }

    setSeekTo = (seekTo: number): void => {
        this.seekTo = seekTo;
    }
}
