import {action, observable, reaction, runInAction} from "mobx";
import {ApiError, getInitialApiErrorFromResponse, StickerApi} from "../../api";
import {EntitiesStore} from "../../entities-store";

export class SearchStickerPacksStore {
    @observable
    name = "";

    @observable
    pending = false;

    @observable
    currentPage = 0;

    @observable
    error?: ApiError = undefined;

    @observable
    searchResults: string[] = [];

    @observable
    reactToNameChange = false;

    constructor(private readonly entities: EntitiesStore) {
        reaction(
            () => this.name,
            () => runInAction(() => {
                if (this.reactToNameChange) {
                    this.currentPage = 0;
                    this.searchResults = [];
                    this.searchStickerPacks();
                }
            }),
            {
                delay: 50
            }
        );
    }

    @action
    setReactToNameChange = (reactToNameChange: boolean): void => {
        this.reactToNameChange = reactToNameChange;
    }

    @action
    setName = (name: string): void => {
        this.name = name;
    }

    @action
    searchStickerPacks = (): void => {
        this.pending = true;
        this.error = undefined;

        StickerApi.searchStickerPacks(this.name, {
            page: this.currentPage,
            pageSize: 50
        })
            .then(({data}) => runInAction(() => {
                if (data.length !== 0) {
                    this.entities.insertStickerPacks(data);
                    this.searchResults.push(...data.map(stickerPack => stickerPack.id));
                    this.currentPage = this.currentPage + 1;
                }
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false))
    }

    @action
    reset = (): void => {
        this.currentPage = 0;
        this.reactToNameChange = false;
        this.name = "";
        this.searchResults = [];
        this.error = undefined;
        this.pending = false;
    }
}
