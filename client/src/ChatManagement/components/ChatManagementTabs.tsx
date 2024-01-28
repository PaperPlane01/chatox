import React, {ChangeEvent, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CircularProgress, Tab, Typography} from "@mui/material";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import {ChatManagementTabWrapper} from "./ChatManagementTabWrapper";
import {ChatManagementMenuItemWrapper} from "./ChatManagementMenuItemWrapper";
import {CHAT_MANAGEMENT_TABS, ChatManagementTab} from "../types";
import {useChatManagementPending, useChatManagementPermissions, useTabAccessMap} from "../hooks";
import {useLocalization, useRouter, useStore} from "../../store";
import {commonStyles, createTabStyles} from "../../style";
import {Routes} from "../../router";

const useStyles = createTabStyles();

export const ChatManagementTabs: FunctionComponent = observer(() => {
    const {
        chatManagement: {
            activeTab
        },
        chat: {
            selectedChat
        }
    } = useStore();
    const {l} = useLocalization();
    const router = useRouter();
    const classes = useStyles();
    const pending = useChatManagementPending();
    const {
        canUpdateChat,
        canBlockUsersInChat,
        canCreateChatRole,
        canDeleteChat,
        canManageInvites,
        canApproveJoinChatRequests,
        hasAccessToChatManagementPage,
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

    const goTo = (tab: string): void => {
        if (!selectedChat) {
            return;
        }

        router.goTo(Routes.chatManagementTab, {
            slug: selectedChat.slug || selectedChat.id,
            tab: tab.toLowerCase()
        });
    };


    if (pending) {
        return <CircularProgress size={25} color="primary" style={commonStyles.centered}/>;
    }

    if (!selectedChat) {
        return null;
    }

    if (!hasAccessToChatManagementPage) {
        return <Typography>{l("common.no-access")}</Typography>;
    }

    return (
        <div className={classes.tabsContainer}>
            <TabContext value={activeTab || ChatManagementTab.INFO}>
                <TabList orientation="vertical"
                         variant="fullWidth"
                         className={classes.tabs}
                         onChange={(_: ChangeEvent<{}>, newValue: string) => goTo(newValue)}
                         classes={{
                             flexContainer: classes.flexContainer
                         }}
                >
                    {CHAT_MANAGEMENT_TABS.map(tab => tabAccessMap.get(tab) && (
                        <Tab value={tab}
                             label={<ChatManagementMenuItemWrapper tab={tab}/>}
                             key={`${tab}_tab`}
                        />
                    ))}
                </TabList>
                {CHAT_MANAGEMENT_TABS.map(tab => (
                    <TabPanel value={tab}
                              className={classes.fullWidth}
                              key={`${tab}_tabPanel`}
                    >
                        <ChatManagementTabWrapper tab={tab} accessible={Boolean(tabAccessMap.get(tab))}/>
                    </TabPanel>
                ))}
            </TabContext>
        </div>
    );
});
