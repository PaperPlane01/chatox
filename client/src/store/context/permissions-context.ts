import {createContext} from "react";
import {store} from "../store";
import {MessagePermissions} from "../../Message/permissions";
import {ChatParticipantPermissions, ChatPermissions} from "../../Chat/permissions";
import {ChatBlockingPermissions} from "../../ChatBlocking";
import {GlobalBanPermissions} from "../../GlobalBan";

class PermissionsContext {
    constructor(public readonly messages: MessagePermissions,
                public readonly chats: ChatPermissions,
                public readonly chatParticipants: ChatParticipantPermissions,
                public readonly chatBlockings: ChatBlockingPermissions,
                public readonly globalBans: GlobalBanPermissions) {
    }
}

const messages = new MessagePermissions(
    store.entities,
    store.authorization,
    store.userChatRoles
);
const chats = new ChatPermissions(
    store.entities,
    store.authorization,
    store.userChatRoles
);
const chatParticipants = new ChatParticipantPermissions(
    store.entities,
    store.authorization,
    store.userChatRoles
);
const chatBlockings = new ChatBlockingPermissions(
    store.entities,
    store.authorization,
    store.userChatRoles
);
const globalBans = new GlobalBanPermissions(
    store.entities,
    store.authorization
);

export const permissionsContext = createContext(
    new PermissionsContext(
        messages,
        chats,
        chatParticipants,
        chatBlockings,
        globalBans
    )
);