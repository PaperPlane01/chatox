import {action, computed, observable, reaction} from "mobx";
import {ChatParticipationEntity, UpdateChatParticipantFormData} from "../types";
import {ChatRole} from "../../api/types/response";
import {EntitiesStore} from "../../entities-store";
import {ApiError, ChatApi, getInitialApiErrorFromResponse} from "../../api";

export class UpdateChatParticipantStore {
    @observable
    updateChatParticipantFormData: UpdateChatParticipantFormData = {
        chatRole: ChatRole.USER
    }

    @observable
    updatedParticipantId?: string = undefined;

    @observable
    updateChatParticipantDialogOpen: boolean = false;

    @observable
    pending: boolean = false;

    @observable
    showSnackbar: boolean = false;

    @observable
    error?: ApiError = undefined;

    @computed
    get updatedParticipant(): ChatParticipationEntity | undefined {
        if (!this.updatedParticipantId) {
            return undefined;
        }

        return this.entities.chatParticipations.findById(this.updatedParticipantId);
    }

    @computed
    get chatId(): string | undefined {
        if (!this.updatedParticipant) {
            return undefined;
        }

        return this.updatedParticipant.chatId;
    }

    constructor(private readonly entities: EntitiesStore) {
        reaction(
            () => this.updatedParticipant,
            participant => {
                if (participant) {
                    this.updateChatParticipantFormData.chatRole = participant.role;
                } else {
                    this.updateChatParticipantFormData.chatRole = ChatRole.USER;
                }
            }
        );
    }

    @action
    setUpdatedParticipantId = (participantId?: string): void => {
        this.updatedParticipantId = participantId;
    }

    @action
    setUpdateChatParticipantDialogOpen = (updateChatParticipantDialogOpen: boolean): void => {
        this.updateChatParticipantDialogOpen = updateChatParticipantDialogOpen;
    }

    @action
    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    }

    @action
    setFormValue = <Key extends keyof UpdateChatParticipantFormData>(key: Key, value: UpdateChatParticipantFormData[Key]): void => {
        this.updateChatParticipantFormData[key] = value;
    }

    @action
    updateChatParticipant = (): void => {
        if (!this.updatedParticipant || !this.chatId) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        ChatApi.updateChatParticipant(this.chatId, this.updatedParticipant.id, {
            chatRole: this.updateChatParticipantFormData.chatRole
        })
            .then(({data}) => {
                this.entities.insertChatParticipation(data);
                this.setUpdateChatParticipantDialogOpen(false);
                this.setUpdatedParticipantId(undefined);
                this.setShowSnackbar(true);
            })
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.pending = false);
    }
}
