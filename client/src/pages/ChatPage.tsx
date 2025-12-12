import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Grid, Hidden} from "@mui/material";
import {
    ChatInfoContainer,
    ChatInfoDialog,
    ChatsOfCurrentUserListWrapper,
    ConfirmChatDeletionDialog,
    SpecifyChatDeletionReasonDialog
} from "../Chat";
import {UpdateChatParticipantDialog} from "../ChatParticipant/components";
import {ChatAppBar} from "../ChatAppBar/components";
import {
    MessageDialog,
    MessagesListWrapper,
    PinMessageSnackbarManager,
    ScheduleMessageDialog,
    UnpinMessageSnackbarManager
} from "../Message/components";
import {AttachedFilesDialog} from "../MessageForm/components";
import {BlockUserInChatByIdOrSlugDialog, CreateChatBlockingDialog} from "../ChatBlocking/components";
import {BanUserGloballyDialog} from "../GlobalBan/components";
import {ReportChatDialog, ReportMessageDialog} from "../Report/components";
import {DeleteStickerPackDialog, StickerPackDialog, StickerPreviewDialog} from "../Sticker/components";
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
            </Grid>
            <ChatInfoDialog/>
            <BlockUserInChatByIdOrSlugDialog/>
            <MessageDialog/>
            <AttachedFilesDialog/>
            <BanUserGloballyDialog/>
            <UpdateChatParticipantDialog/>
            <PinMessageSnackbarManager/>
            <UnpinMessageSnackbarManager/>
            <ScheduleMessageDialog/>
            <ReportMessageDialog/>
            <ReportChatDialog/>
            <StickerPackDialog/>
            <ConfirmChatDeletionDialog/>
            <SpecifyChatDeletionReasonDialog/>
            <CreateChatBlockingDialog/>
            <DeleteStickerPackDialog/>
            <StickerPreviewDialog/>
        </Fragment>
    );
});

export default ChatPage;
