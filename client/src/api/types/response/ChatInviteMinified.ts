import {Chat} from "./Chat";
import {JoinAllowanceMap} from "./JoinAllowanceMap";
import {ChatInviteUsage} from "./ChatInviteUsage";

export interface ChatInviteMinified {
    id: string,
    chat: Chat,
    joinAllowanceSettings: JoinAllowanceMap,
    usage: ChatInviteUsage
}
