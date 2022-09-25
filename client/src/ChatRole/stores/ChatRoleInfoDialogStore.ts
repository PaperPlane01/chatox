import {action, observable, computed} from "mobx";

export class ChatRoleInfoDialogStore {
    @observable
    roleId: string | undefined = undefined;

    @observable
    editMode: boolean = false;

    @computed
    get chatRoleInfoDialogOpen(): boolean {
        return Boolean(this.roleId);
    }

    @action
    setRoleId = (roleId: string | undefined): void => {
        this.roleId = roleId;
    }

    @action
    closeDialog = (): void => {
        this.setRoleId(undefined);
    }

    @action
    setEditMode = (editMode: boolean): void => {
        this.editMode = editMode;
    }
}