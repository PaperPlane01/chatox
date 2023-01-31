import {makeAutoObservable} from "mobx";

export class MarkdownPreviewDialogStore {
    markdownPreviewDialogOpen: boolean = false;


    constructor() {
        makeAutoObservable(this);
    }

    setMarkdownPreviewDialogOpen = (markdownPreviewDialogOpen: boolean): void => {
        this.markdownPreviewDialogOpen = markdownPreviewDialogOpen;
    };
}
