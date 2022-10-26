import React, {FunctionComponent, Fragment} from "react";
import {observer} from "mobx-react";
import {Divider} from "@mui/material";
import {SendMessagesChatFeatureForm} from "./SendMessagesChatFeatureForm";
import {DefaultChatFeatureForm} from "./DefaultChatFeatureForm";
import {LevelBasedChatFeatureForm} from "./LevelBasedChatFeatureForm";
import {BlockUsersInChatFeatureForm} from "./BlockUsersInChatFeatureForm";
import {useStore, useLocalization} from "../../store";

export const ChatRoleFeatureForms: FunctionComponent = observer(() => {
    const {
        chatFeaturesForm: {
            featuresForms: {
                pinMessages,
                showRoleNameInMessages,
                scheduleMessages,
                deleteOwnMessages,
                deleteOtherUsersMessages,
                messageDeletionsImmunity,
                blockingImmunity,
                kickUsers,
                kickImmunity,
                assignChatRole,
                modifyChatRoles,
                changeChatSettings,
                deleteChat
            }
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Fragment>
            <SendMessagesChatFeatureForm/>
            <Divider/>
            <DefaultChatFeatureForm formValues={showRoleNameInMessages.formValues}
                                    name={l("chat.feature.showRoleNameInChat")}
                                    setFormValue={showRoleNameInMessages.setFormValue}
            />
            <Divider/>
            <DefaultChatFeatureForm formValues={pinMessages.formValues}
                                    name={l("chat.feature.pinMessages")}
                                    setFormValue={pinMessages.setFormValue}
            />
            <Divider/>
            <DefaultChatFeatureForm formValues={scheduleMessages.formValues}
                                    name={l("chat.feature.scheduleMessages")}
                                    setFormValue={scheduleMessages.setFormValue}
            />
            <Divider/>
            <DefaultChatFeatureForm formValues={deleteOwnMessages.formValues}
                                    name={l("chat.feature.deleteOwnMessages")}
                                    setFormValue={deleteOwnMessages.setFormValue}
            />
            <Divider/>
            <DefaultChatFeatureForm formValues={deleteOtherUsersMessages.formValues}
                                    name={l("chat.feature.deleteOtherUsersMessages")}
                                    setFormValue={deleteOtherUsersMessages.setFormValue}
            />
            <Divider/>
            <LevelBasedChatFeatureForm formValues={messageDeletionsImmunity.formValues}
                                       formErrors={messageDeletionsImmunity.formErrors}
                                       name={l("chat.feature.messageDeletionImmunity")}
                                       setFormValue={messageDeletionsImmunity.setFormValue}
            />
            <Divider/>
            <BlockUsersInChatFeatureForm/>
            <Divider/>
            <LevelBasedChatFeatureForm formValues={blockingImmunity.formValues}
                                       formErrors={blockingImmunity.formErrors}
                                       name={l("chat.feature.blockingImmunity")}
                                       setFormValue={blockingImmunity.setFormValue}
            />
            <Divider/>
            <DefaultChatFeatureForm formValues={kickUsers.formValues}
                                    name={l("chat.feature.kickUsers")}
                                    setFormValue={kickUsers.setFormValue}
            />
            <Divider/>
            <LevelBasedChatFeatureForm formValues={kickImmunity.formValues}
                                       formErrors={kickImmunity.formErrors}
                                       name={l("chat.feature.kickImmunity")}
                                       setFormValue={kickImmunity.setFormValue}
            />
            <Divider/>
            <LevelBasedChatFeatureForm formValues={assignChatRole.formValues}
                                       formErrors={assignChatRole.formErrors}
                                       name={l("chat.feature.assignChatRole")}
                                       setFormValue={assignChatRole.setFormValue}
            />
            <Divider/>
            <DefaultChatFeatureForm formValues={modifyChatRoles.formValues}
                                    name={l("chat.feature.modifyChatRole")}
                                    setFormValue={modifyChatRoles.setFormValue}
            />
            <Divider/>
            <DefaultChatFeatureForm formValues={changeChatSettings.formValues}
                                    name={l("chat.feature.changeChatSettings")}
                                    setFormValue={changeChatSettings.setFormValue}
            />
            <Divider/>
            <DefaultChatFeatureForm formValues={deleteChat.formValues}
                                    name={l("chat.feature.deleteChat")}
                                    setFormValue={deleteChat.setFormValue}
            />
        </Fragment>
    );
});
