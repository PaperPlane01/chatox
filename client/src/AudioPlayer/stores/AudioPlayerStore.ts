import {makeAutoObservable, reaction} from "mobx";
import {AudioUploadMetadata, Upload, UploadType} from "../../api/types/response";
import {AudioType} from "../types";
import {EntitiesStore} from "../../entities-store";
import {isDefined} from "../../utils/object-utils";

export class AudioPlayerStore {
    currentTrackId?: string = undefined;

    currentTrackType?: AudioType = undefined;

    volume = 1;

    playing = false;

    currentTime = 0;

    seekToFraction: number | undefined = undefined;

    get currentTrack(): Upload<AudioUploadMetadata> | undefined {
        if (!this.currentTrackId || !this.currentTrackType) {
            return undefined;
        }

        if (this.currentTrackType === UploadType.AUDIO) {
            return this.entities.uploads.findAudio(this.currentTrackId);
        } else {
            return this.entities.uploads.findVoiceMessage(this.currentTrackId);
        }
    }

    get currentTimeFraction(): number {
        const duration = this.currentTrack?.meta?.duration;

        if (!isDefined(duration)) {
            return 0;
        }

        return this.currentTime / duration * 1000;
    }

    get seekToTime(): number | undefined {
        if (!isDefined(this.seekToFraction)) {
            return undefined;
        }

        const duration = this.currentTrack?.meta?.duration;

        if (!isDefined(duration)) {
            return undefined;
        }

        return duration * this.seekToFraction / 1000;
    }

    constructor(private readonly entities: EntitiesStore) {
        makeAutoObservable(this, {}, {autoBind: true});

        reaction(
            () => this.currentTrackId,
            () => this.setSeekToFraction(0)
        );
    }

    setCurrentTrackId(currentTrackId?: string): void {
        this.currentTrackId = currentTrackId;
    }

    setCurrentTrackType(currentTrackType?: AudioType): void {
        this.currentTrackType = currentTrackType;
    }

    setVolume(volume: number): void {
        this.volume = volume;
    }

    setPlaying(playing: boolean): void {
        this.playing = playing;
    }

    setCurrentTime(currentTime: number): void {
        this.currentTime = currentTime;
    }

    setSeekToFraction(seekToFraction: number): void {
        this.seekToFraction = seekToFraction;
    }
}
