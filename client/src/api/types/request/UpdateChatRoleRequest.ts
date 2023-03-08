import {CreateChatRoleRequest} from "./CreateChatRoleRequest";

export interface UpdateChatRoleRequest extends CreateChatRoleRequest{
    defaultRoleId?: string
}