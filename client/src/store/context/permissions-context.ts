import {createContext} from "react";
import {store} from "../store";
import {MessagePermissions} from "../../Message/permissions";
import {ChatPermissions} from "../../Chat/permissions";
import {ChatParticipantPermissions} from "../../ChatParticipant/permissions";
import {ChatBlockingPermissions} from "../../ChatBlocking";
import {GlobalBanPermissions} from "../../GlobalBan";
import {ChatRolePermissions} from "../../ChatRole/permissions";

class PermissionsContext {
    constructor(public readonly messages: MessagePermissions,
                public readonly chats: ChatPermissions,
                public readonly chatParticipants: ChatParticipantPermissions,
                public readonly chatBlockings: ChatBlockingPermissions,
                public readonly globalBans: GlobalBanPermissions,
                public readonly chatRoles: ChatRolePermissions) {
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
    store.authorization
);
const chatRoles = new ChatRolePermissions(
    store.entities,
    store.authorization,
    store.userChatRoles
);

export const permissionsContext = createContext(
    new PermissionsContext(
        messages,
        chats,
        chatParticipants,
        chatBlockings,
        globalBans,
        chatRoles
    )
);