import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {Link} from "mobx-router";
import {CircularProgress, List, Typography} from "@mui/material";
import {ChatManagementMenuItemWrapper} from "./ChatManagementMenuItemWrapper";
import {ChatManagementTabWrapper} from "./ChatManagementTabWrapper";
import {ChatManagementFullScreenDialog} from "./ChatManagementFullScreenDialog";
import {CHAT_MANAGEMENT_TABS, ChatManagementTab} from "../types";
import {useChatManagementPending, useChatManagementPermissions, useTabAccessMap} from "../hooks";
import {useLocalization, useRouter, useStore} from "../../store";
import {Routes} from "../../router";
import {commonStyles} from "../../style";
import {TranslatedText} from "../../localization";

type DialogHeadersMap = {
    [Tab in ChatManagementTab]: (bindings?: object) => ReactNode
};

const dialogHeaders: DialogHeadersMap = {
    BLOCKINGS(bindings?: object): ReactNode {
        return <TranslatedText label="chat.blocking.list" bindings={bindings}/>;
    }, 
    DELETION(bindings?: object): ReactNode {
        return <TranslatedText label="chat.delete" bindings={bindings}/>;
    },
    INFO(bindings?: object): ReactNode {
        return <TranslatedText label="chat.update" bindings={bindings}/>;
    }, 
    PARTICIPANTS(): ReactNode {
        return null;
    },
    INVITES(bindings?: object): ReactNode {
        return <TranslatedText label="chat.invite.list" bindings={bindings}/>
    },
    JOIN_REQUESTS(): ReactNode {
        return <TranslatedText label="chat.join.requests"/>
    },
    ROLES(bindings?: object): ReactNode {
        return <TranslatedText label="chat-role.list" bindings={bindings}/>
    },
    SECURITY(): ReactNode {
        return <TranslatedText label="chat.management.tab.SECURITY"/>
    },
    SLOW_MODE(bindings?: object): ReactNode {
        return <TranslatedText label="chat.management.tab.SLOW_MODE" bindings={bindings}/>
    }
};

const renderDialogHeader = (tab: ChatManagementTab, bindings?: object): ReactNode => {
    return dialogHeaders[tab](bindings);
};

export const ChatManagementMenu: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChat
        },
        chatManagement: {
            activeTab
        }
    } = useStore();
    const {l} = useLocalization();
    const router = useRouter();
    const pending = useChatManagementPending();
    const {
        canUpdateChat,
        canBlockUsersInChat,
        canCreateChatRole,
        canDeleteChat,
        canManageInvites,
        canApproveJoinChatRequests,
        hasAccessToChatManagementPage
    } = useChatManagementPermissions();
    const tabAccessMap = useTabAccessMap({
        canUpdateChat,
        canBlockUsersInChat,
        canCreateChatRole,
        canDeleteChat,
        canManageInvites,
        canApproveJoinChatRequests,
        hasAccessToChatManagementPage
    });

    if (pending) {
        return <CircularProgress size={25} color="primary" style={commonStyles.centered}/>
    }

    if (!hasAccessToChatManagementPage) {
        return <Typography>{l("common.no-access")}</Typography>;
    }

    if (!selectedChat) {
        return null;
    }

    return (
        <Fragment>
            <List>
                {CHAT_MANAGEMENT_TABS.map(tab => tabAccessMap.get(tab)
                    ? (
                        <Link route={Routes.chatManagementTab}
                              router={router}
                              params={{slug: selectedChat.slug ?? selectedChat.id, tab: tab.toLowerCase()}}
                              style={commonStyles.undecoratedLink as any}
                        >
                            <ChatManagementMenuItemWrapper tab={tab}/>
                        </Link>
                    )
                    : null
                )}
            </List>
            {CHAT_MANAGEMENT_TABS.map(tab => (
                <ChatManagementFullScreenDialog open={activeTab === tab}
                                                title={renderDialogHeader(tab, {chatName: selectedChat.name})}
                                                chatSlug={selectedChat.slug ?? selectedChat.id}
                                                key={`${tab}_tab`}
                >
                    <ChatManagementTabWrapper tab={tab} accessible={Boolean(tabAccessMap.get(tab))} hideHeader/>
                </ChatManagementFullScreenDialog>
            ))}
        </Fragment>
    );
});
