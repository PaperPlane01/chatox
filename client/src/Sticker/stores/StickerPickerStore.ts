import {observable, action, reaction} from "mobx";
import {InstalledStickerPacksStore} from "./InstalledStickerPacksStore";
import {AuthorizationStore} from "../../Authorization";

export class StickerPickerStore {
    @observable
    selectedStickerPackId?: string = undefined;

    constructor(private readonly installedStickerPacksStore: InstalledStickerPacksStore,
                private readonly authorizationStore: AuthorizationStore) {
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

    @action
    setSelectedStickerPackId = (id?: string): void => {
        this.selectedStickerPackId = id;
    }
}
