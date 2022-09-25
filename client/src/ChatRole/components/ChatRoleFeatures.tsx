import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Divider} from "@mui/material";
import {DefaultChatFeature} from "./DefaultChatFeature";
import {BlockUsersInChatFeature} from "./BlockUsersInChatFeature";
import {SendMessagesChatFeature} from "./SendMessagesChatFeature";
import {LevelBasedChatFeature} from "./LevelBasedChatFeature";
import {ChatRoleEntity} from "../types";
import {useLocalization} from "../../store";

interface ChatRoleFeaturesProps {
    role: ChatRoleEntity
}

export const ChatRoleFeatures: FunctionComponent<ChatRoleFeaturesProps> = observer(({role}) => {
   const {l} = useLocalization();

   return (
       <Fragment>
           <SendMessagesChatFeature feature={role.features.sendMessages}/>
           <Divider/>
           <DefaultChatFeature name={l("chat.feature.pinMessages")} feature={role.features.pinMessages}/>
           <Divider/>
           <DefaultChatFeature name={l("chat.feature.scheduleMessages")} feature={role.features.scheduleMessages}/>
           <Divider/>
           <DefaultChatFeature name={l("chat.feature.deleteOwnMessages")} feature={role.features.deleteOwnMessages}/>
           <Divider/>
           <DefaultChatFeature name={l("chat.feature.deleteOtherUsersMessages")} feature={role.features.deleteOwnMessages}/>
           <Divider/>
           <LevelBasedChatFeature name={l("chat.feature.messageDeletionImmunity")} feature={role.features.messageDeletionsImmunity}/>
           <Divider/>
           <BlockUsersInChatFeature feature={role.features.blockUsers}/>
           <Divider/>
           <LevelBasedChatFeature name={l("chat.feature.blockingImmunity")} feature={role.features.blockingImmunity}/>
           <Divider/>
           <DefaultChatFeature name={l("chat.feature.kickUsers")} feature={role.features.kickUsers}/>
           <Divider/>
           <LevelBasedChatFeature name={l("chat.feature.kickImmunity")} feature={role.features.kickImmunity}/>
           <Divider/>
           <LevelBasedChatFeature name={l("chat.feature.assignChatRole")} feature={role.features.assignChatRole}/>
           <Divider/>
           <DefaultChatFeature name={l("chat.feature.modifyChatRole")} feature={role.features.modifyChatRoles}/>
           <Divider/>
           <DefaultChatFeature name={l("chat.feature.changeChatSettings")} feature={role.features.changeChatSettings}/>
           <Divider/>
           <DefaultChatFeature name={l("chat.feature.deleteChat")} feature={role.features.deleteChat}/>
       </Fragment>
   );
});