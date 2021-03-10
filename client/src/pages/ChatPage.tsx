import React, {Fragment, FunctionComponent} from "react";
import {Grid, Hidden} from "@material-ui/core";
import {
    ChatAppBar,
    ChatInfoContainer,
    ChatInfoDialog,
    ChatsOfCurrentUserList,
    ConfirmChatDeletionDialog,
    SpecifyChatDeletionReasonDialog,
    UpdateChatDialog,
    UpdateChatParticipantDialog
} from "../Chat";
import {
    AttachedFilesDialog,
    MessageDialog,
    MessagesListWrapper,
    PinMessageSnackbarManager,
    UnpinMessageSnackbarManager,
    UpdateMessageDialog,
    ScheduleMessageDialog
} from "../Message";
import {
    BlockUserInChatByIdOrSlugDialog,
    ChatBlockingInfoDialog,
    ChatBlockingsDialog,
    CreateChatBlockingDialog,
    UpdateChatBlockingDialog
} from "../ChatBlocking";
import {BanUserGloballyDialog} from "../GlobalBan";

export const ChatPage: FunctionComponent = () => (
    <Fragment>
        <Grid container>
            <Grid item xs={12}>
                <ChatAppBar/>
            </Grid>
            <Grid item xs={12}>
                <Grid item xs={12}
                      style={{display: "flex"}}
                      justify="space-between"
                >
                    <Hidden mdDown>
                        <ChatsOfCurrentUserList/>
                    </Hidden>
                    <Grid container>
                        <Grid item xs={12} lg={9}>
                            <MessagesListWrapper/>
                        </Grid>
                        <Hidden mdDown>
                            <Grid item lg={3}>
                                <ChatInfoContainer/>
                            </Grid>
                        </Hidden>
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
        </Grid>
    </Fragment>
);

export default ChatPage;
