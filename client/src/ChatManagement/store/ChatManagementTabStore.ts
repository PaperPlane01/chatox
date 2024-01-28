import {makeAutoObservable, reaction} from "mobx";
import {ChatManagementTab} from "../types";
import {ChatParticipantsStore, JoinChatRequestsStore} from "../../ChatParticipant";
import {RolesOfChatStore} from "../../ChatRole";
import {ChatBlockingsOfChatStore} from "../../ChatBlocking";
import {ChatInviteListStore} from "../../ChatInvite";

export class ChatManagementTabStore {
    activeTab?: ChatManagementTab = undefined;

    constructor(private readonly chatParticipantsStore: ChatParticipantsStore,
                private readonly rolesOfChatStore: RolesOfChatStore,
                private readonly chatBlockingsStore: ChatBlockingsOfChatStore,
                private readonly chatInvitesStore: ChatInviteListStore,
                private readonly joinChatRequestsStore: JoinChatRequestsStore) {
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
                    case ChatManagementTab.INVITES:
                        this.chatInvitesStore.fetchChatInvites();
                        break;
                    case ChatManagementTab.JOIN_REQUESTS:
                        this.joinChatRequestsStore.fetchJoinChatRequests();
                        break;
                }
            }
        );
    }

    setActiveTab = (tab?: ChatManagementTab): void => {
        this.activeTab = tab;
    }
}