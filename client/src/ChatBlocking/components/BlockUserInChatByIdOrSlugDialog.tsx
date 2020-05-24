import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    TextField,
    Typography,
    withMobileDialog,
    WithMobileDialog
} from "@material-ui/core";
import {localized, Localized, TranslationFunction} from "../../localization";
import {ChatOfCurrentUserEntity} from "../../Chat/types";
import {ApiError} from "../../api";
import {MapMobxToProps} from "../../store";

interface BlockUserInChatByIdOrSlugDialogMobxProps {
    selectedChatId?: string,
    checkingUser: boolean,
    error?: ApiError,
    blockUserInChatByIdOrSlugDialogOpen: boolean,
    userIdOrSlug: string,
    findChat: (chatId: string) => ChatOfCurrentUserEntity,
    setUserIdOrSlug: (userIdOrSlug: string) => void,
    setBlockUserInChatByIdOrSlugDialogOpen: (blockUserInChatByIdOrSlugDialogOpen: boolean) => void
}

type BlockUserInChatByIdOrSlugDialogProps = BlockUserInChatByIdOrSlugDialogMobxProps & Localized
    & WithMobileDialog;

const getErrorLabel = (error: ApiError, l: TranslationFunction): string => {
    if (error.status === 404) {
        return l("chat.blocking.user-id-or-slug.not-exist");
    } else {
        return l("chat.blocking.user-id-or-slug.unknown-error", {errorStatus: error.status})
    }
};

const _BlockUserInChatByIdOrSlugDialog: FunctionComponent<BlockUserInChatByIdOrSlugDialogProps> = ({
    selectedChatId,
    checkingUser,
    error,
    blockUserInChatByIdOrSlugDialogOpen,
    userIdOrSlug,
    findChat,
    setUserIdOrSlug,
    setBlockUserInChatByIdOrSlugDialogOpen,
    l,
    fullScreen
}) => {
    if (!selectedChatId) {
        return null;
    }

    const chat = findChat(selectedChatId);

    return (
        <Dialog open={blockUserInChatByIdOrSlugDialogOpen}
                onClose={() => setBlockUserInChatByIdOrSlugDialogOpen(false)}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="md"
        >
            <DialogTitle>
                {l("chat.blocking.create.without-username", {chatName: chat.name})}
            </DialogTitle>
            <DialogContent>
                <TextField value={userIdOrSlug}
                           label={l("chat.blocking.user-id-or-slug")}
                           onChange={event => setUserIdOrSlug(event.target.value)}
                           fullWidth
                           margin="dense"
                           InputProps={{
                               endAdornment: checkingUser && (
                                   <InputAdornment position="end">
                                       <CircularProgress size={15}
                                                         color="primary"
                                       />
                                   </InputAdornment>
                               )
                           }}
                />
                {error && (
                    <Typography style={{color: "red"}}>
                        {getErrorLabel(error, l)}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        color="secondary"
                        onClick={() => setBlockUserInChatByIdOrSlugDialogOpen(false)}
                >
                    {l("close")}
                </Button>
            </DialogActions>
        </Dialog>
    )
};

const mapMobxToProps: MapMobxToProps<BlockUserInChatByIdOrSlugDialogMobxProps> = ({
    chat,
    blockUserInChatByIdOrSlug,
    entities
}) => ({
    selectedChatId: chat.selectedChatId,
    userIdOrSlug: blockUserInChatByIdOrSlug.userIdOrSlug,
    checkingUser: blockUserInChatByIdOrSlug.checkingUser,
    error: blockUserInChatByIdOrSlug.error,
    blockUserInChatByIdOrSlugDialogOpen: blockUserInChatByIdOrSlug.blockUserInChatByIdOrSlugDialogOpen,
    setBlockUserInChatByIdOrSlugDialogOpen: blockUserInChatByIdOrSlug.setBlockUserInChatByIdOrSlugDialogOpen,
    setUserIdOrSlug: blockUserInChatByIdOrSlug.setUserIdOrSlug,
    findChat: entities.chats.findById
});

export const BlockUserInChatByIdOrSlugDialog = localized(
    withMobileDialog()(
        inject(mapMobxToProps)(observer(_BlockUserInChatByIdOrSlugDialog))
    )
) as FunctionComponent;

