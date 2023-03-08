import {makeAutoObservable, reaction, runInAction} from "mobx";
import {ApiError, getInitialApiErrorFromResponse, StickerApi} from "../../api";
import {EntitiesStore} from "../../entities-store";

export class SearchStickerPacksStore {
    name = "";

    pending = false;

    currentPage = 0;

    error?: ApiError = undefined;

    searchResults: string[] = [];

    reactToNameChange = false;

    constructor(private readonly entities: EntitiesStore) {
       makeAutoObservable(this);

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

    setReactToNameChange = (reactToNameChange: boolean): void => {
        this.reactToNameChange = reactToNameChange;
    };

    setName = (name: string): void => {
        this.name = name;
    };

    searchStickerPacks = (): void => {
        this.pending = true;
        this.error = undefined;

        StickerApi.searchStickerPacks(this.name, {
            page: this.currentPage,
            pageSize: 50
        })
            .then(({data}) => runInAction(() => {
                if (data.length !== 0) {
                    this.entities.stickerPacks.insertAll(data);
                    this.searchResults.push(...data.map(stickerPack => stickerPack.id));
                    this.currentPage = this.currentPage + 1;
                }
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false))
    };

    reset = (): void => {
        this.currentPage = 0;
        this.reactToNameChange = false;
        this.name = "";
        this.searchResults = [];
        this.error = undefined;
        this.pending = false;
    };
}
