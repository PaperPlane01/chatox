import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Grid, Hidden} from "@mui/material";
import {
    ChatInfoContainer,
    ChatInfoDialog,
    ChatsOfCurrentUserListWrapper,
    ConfirmChatDeletionDialog,
    SpecifyChatDeletionReasonDialog,
    UpdateChatDialog
} from "../Chat";
import {UpdateChatParticipantDialog} from "../ChatParticipant";
import {ChatAppBar} from "../ChatAppBar";
import {
    AttachedFilesDialog,
    MessageDialog,
    MessagesListWrapper,
    PinMessageSnackbarManager,
    ScheduleMessageDialog,
    UnpinMessageSnackbarManager,
    UpdateMessageDialog
} from "../Message";
import {
    BlockUserInChatByIdOrSlugDialog,
    ChatBlockingInfoDialog,
    ChatBlockingsDialog,
    CreateChatBlockingDialog,
    UpdateChatBlockingDialog
} from "../ChatBlocking";
import {BanUserGloballyDialog} from "../GlobalBan";
import {ReportChatDialog, ReportMessageDialog} from "../Report";
import {StickerPackDialog} from "../Sticker";
import {ChatRoleInfoDialog, ChatRolesDialog, CreateChatRoleDialog} from "../ChatRole";
import {useStore} from "../store";
import {ChatType} from "../api/types/response";

export const ChatPage: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChat
        }
    } = useStore();

    return (
        <Fragment>
            <Grid container>
                <Grid item xs={12}>
                    <ChatAppBar/>
                </Grid>
                <Grid item xs={12}>
                    <Grid item xs={12}
                          style={{display: "flex"}}
                          justifyContent="space-between"
                    >
                        <Hidden xlDown>
                            <ChatsOfCurrentUserListWrapper/>
                        </Hidden>
                        <Grid container>
                            <Grid item xs={12} lg={selectedChat && selectedChat.type === ChatType.DIALOG ? 12 : 9}>
                                <MessagesListWrapper/>
                            </Grid>
                            {selectedChat && selectedChat.type !== ChatType.DIALOG && (
                                <Hidden xlDown>
                                    <Grid item lg={3}>
                                        <ChatInfoContainer/>
                                    </Grid>
                                </Hidden>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
                <CreateChatBlockingDialog/>
                <ChatBlockingsDialog/>
                <ChatBlockingInfoDialog/>
                <UpdateChatBlockingDialog/>
                <ChatInfoDialog/>
                <BlockUserInChatByIdOrSlugDialog/>
                <UpdateChatDialog/>
                <MessageDialog/>
                <UpdateMessageDialog/>
                <AttachedFilesDialog/>
                <ConfirmChatDeletionDialog/>
                <SpecifyChatDeletionReasonDialog/>
                <BanUserGloballyDialog/>
                <UpdateChatParticipantDialog/>
                <PinMessageSnackbarManager/>
                <UnpinMessageSnackbarManager/>
                <ScheduleMessageDialog/>
                <ReportMessageDialog/>
                <ReportChatDialog/>
                <StickerPackDialog/>
                <ChatRolesDialog/>
                <ChatRoleInfoDialog/>
                <CreateChatRoleDialog/>
            </Grid>
        </Fragment>
    );
});

export default ChatPage;
