import {makeAutoObservable, reaction} from "mobx";
import type {InstalledStickerPacksStore} from "./InstalledStickerPacksStore";
import type {AuthorizationStore} from "../../Authorization/stores";

export class StickerPickerStore {
    selectedStickerPackId?: string = undefined;

    constructor(private readonly installedStickerPacksStore: InstalledStickerPacksStore,
                private readonly authorizationStore: AuthorizationStore) {
        makeAutoObservable(this);

        reaction(
            () => installedStickerPacksStore.installedStickerPacksIds,
            installedStickerPacks => {
                if (installedStickerPacks.length !== 0 && !this.selectedStickerPackId) {
                    this.setSelectedStickerPackId(installedStickerPacks[0]);
                }
            }
        );

        reaction(
            () => this.authorizationStore.currentUser,
            currentUser => {
                if (!currentUser) {
                    this.setSelectedStickerPackId(undefined);
                }
            }
        );
    }

    setSelectedStickerPackId = (id?: string): void => {
        this.selectedStickerPackId = id;
    };
}
