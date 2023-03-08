import {makeAutoObservable} from "mobx";

export class ChatRoleInfoDialogStore {
    roleId: string | undefined = undefined;

    editMode: boolean = false;

    constructor() {
        makeAutoObservable(this);
    }

    get chatRoleInfoDialogOpen(): boolean {
        return Boolean(this.roleId);
    }

    setRoleId = (roleId: string | undefined): void => {
        this.roleId = roleId;
    };

    closeDialog = (): void => {
        this.setRoleId(undefined);
    };

    setEditMode = (editMode: boolean): void => {
        this.editMode = editMode;
    };
}