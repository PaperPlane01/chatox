import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {UpdateChatForm} from "./UpdateChatForm";
import {ChatBlockingsCard} from "./ChatBlockingsCard";
import {SlowModeForm} from "./SlowModeForm";
import {ChatDeletionCard} from "./ChatDeletionCard";
import {ChatManagementTab, ChatManagementTabRenderers} from "../types";
import {TranslatedTypography} from "../../localization";
import {BaseSettingsTabProps} from "../../utils/types";
import {ChatParticipantsCard, JoinChatRequestsCard} from "../../ChatParticipant";
import {ChatRolesCard} from "../../ChatRole";
import {ChatInvitesCard} from "../../ChatInvite";

const chatManagementTabRenderers: ChatManagementTabRenderers = {
    BLOCKINGS: props => <ChatBlockingsCard {...props}/>,
    DELETION: props => <ChatDeletionCard {...props}/>,
    INFO: props => <UpdateChatForm {...props}/>,
    PARTICIPANTS: () => <ChatParticipantsCard defaultMode="all"/>,
    JOIN_REQUESTS: () => <JoinChatRequestsCard/>,
    INVITES: props => <ChatInvitesCard {...props}/>,
    ROLES: props => <ChatRolesCard {...props}/>,
    SECURITY: () => <TranslatedTypography label="feature.not-available"/>,
    SLOW_MODE: props => <SlowModeForm {...props}/>
};

const renderChatManagementTab = (tab: ChatManagementTab, accessible: boolean, hideHeader: boolean): ReactNode => {
    return accessible
        ? chatManagementTabRenderers[tab]({hideHeader})
        : <TranslatedTypography label="common.no-access"/>;
};

interface ChatManagementTabWrapperProps extends Partial<BaseSettingsTabProps> {
    tab: ChatManagementTab,
    accessible: boolean
}

export const ChatManagementTabWrapper: FunctionComponent<ChatManagementTabWrapperProps> = observer(({
    tab,
    accessible,
    hideHeader = false
}) => (
    <Fragment>
        {renderChatManagementTab(tab, accessible, hideHeader)}
    </Fragment>
));