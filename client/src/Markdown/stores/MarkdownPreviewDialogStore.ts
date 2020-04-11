import {observable, action} from "mobx";

export class MarkdownPreviewDialogStore {
    @observable
    markdownPreviewDialogOpen: boolean = false;

    @action
    setMarkdownPreviewDialogOpen = (markdownPreviewDialogOpen: boolean): void => {
        this.markdownPreviewDialogOpen = markdownPreviewDialogOpen;
    }
}
