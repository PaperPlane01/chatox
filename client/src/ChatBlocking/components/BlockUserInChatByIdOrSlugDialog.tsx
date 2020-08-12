import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
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
    withMobileDialog
} from "@material-ui/core";
import {TranslationFunction} from "../../localization";
import {ApiError} from "../../api";
import {useLocalization, useStore} from "../../store";

const getErrorLabel = (error: ApiError, l: TranslationFunction): string => {
    if (error.status === 404) {
        return l("chat.blocking.user-id-or-slug.not-exist");
    } else {
        return l("chat.blocking.user-id-or-slug.unknown-error", {errorStatus: error.status})
    }
};

export const BlockUserInChatByIdOrSlugDialog: FunctionComponent = withMobileDialog()(observer(({
    fullScreen
}) => {
    const {
        chat: {
            selectedChatId
        },
        blockUserInChatByIdOrSlug: {
            blockUserInChatByIdOrSlugDialogOpen,
            checkingUser,
            error,
            userIdOrSlug,
            setUserIdOrSlug,
            setBlockUserInChatByIdOrSlugDialogOpen
        },
        entities: {
            chats: {
                findById: findChat
            }
        }
    } = useStore();
    const {l} = useLocalization();

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
})) as FunctionComponent;
