import {makeAutoObservable, reaction} from "mobx";
import {ChatManagementTab} from "../types";
import {ChatParticipantsStore} from "../../ChatParticipant";
import {RolesOfChatStore} from "../../ChatRole";
import {ChatBlockingsOfChatStore} from "../../ChatBlocking";

export class ChatManagementTabStore {
    activeTab?: ChatManagementTab = undefined;

    constructor(private readonly chatParticipantsStore: ChatParticipantsStore,
                private readonly rolesOfChatStore: RolesOfChatStore,
                private readonly chatBlockingsStore: ChatBlockingsOfChatStore) {
        makeAutoObservable(this);

        reaction(
            () => this.activeTab,
            activeTab => {
                switch (activeTab) {
                    case ChatManagementTab.BLOCKINGS:
                        this.chatBlockingsStore.fetchChatBlockings({abortIfInitiallyFetched: true});
                        break;
                    case ChatManagementTab.PARTICIPANTS:
                        this.chatParticipantsStore.fetchChatParticipants({abortIfInitiallyFetched: true});
                        break;
                    case ChatManagementTab.ROLES:
                        this.rolesOfChatStore.fetchRolesOfChat();
                        break;
                }
            }
        );
    }

    setActiveTab = (tab?: ChatManagementTab): void => {
        this.activeTab = tab;
    }
}