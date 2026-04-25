import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Box, Grid} from "@mui/material";
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
                <Grid size={12}>
                    <ChatAppBar/>
                </Grid>
                <Grid container size={12}>
                    <Grid container size={12}
                          style={{display: "flex"}}
                          justifyContent="space-between"
                    >
                        <Grid sx={{
                            display: {
                                xs: "none",
                                lg: "block"
                            }
                        }}
                              size="auto"
                        >
                            <ChatsOfCurrentUserListWrapper/>
                        </Grid>
                        <Grid container size="grow">
                            <Grid size={{
                                xs: 12,
                                lg: selectedChat?.type === ChatType.DIALOG ? 12 : 9
                            }}>
                                <MessagesListWrapper/>
                            </Grid>
                            {selectedChat?.type !== ChatType.DIALOG && (
                                <Grid sx={{display: {xs: "none", lg: "block"}}} size={{lg: 3}}>
                                    <ChatInfoContainer/>
                                </Grid>
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
