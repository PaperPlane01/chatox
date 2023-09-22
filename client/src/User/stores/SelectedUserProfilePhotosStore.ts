import {makeAutoObservable} from "mobx";
import {computedFn} from "mobx-utils";

export class SelectedUserProfilePhotosStore {
    selectMode = false;

    selectedPhotosIds: string[] = [];

    get selectedPhotosCount(): number {
        return this.selectedPhotosIds.length;
    }

    constructor() {
        makeAutoObservable(this);
    }

    setSelectMode = (selectMode: boolean): void => {
        this.selectMode = selectMode;
    }

    selectPhoto = (photoId: string): void => {
        this.selectedPhotosIds.push(photoId);

        if (!this.selectMode) {
            this.setSelectMode(true);
        }
    }

    isPhotoSelected = computedFn((photoId: string): boolean => this.selectedPhotosIds.includes(photoId))

    unselectPhoto = (photoId: string): void => {
        this.selectedPhotosIds = this.selectedPhotosIds.filter(id => id !== photoId);

        if (this.selectedPhotosIds.length === 0) {
            this.setSelectMode(false);
        }
    }

    clearSelection = (): void => {
        this.setSelectMode(false);
        this.selectedPhotosIds = [];
    }
}