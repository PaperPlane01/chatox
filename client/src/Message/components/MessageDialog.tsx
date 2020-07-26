import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {Dialog, DialogTitle, DialogContent, IconButton, WithMobileDialog, withMobileDialog} from "@material-ui/core";
import {Close} from "@material-ui/icons";
import {MessagesListItem} from "./MessagesListItem";
import {MapMobxToProps} from "../../store";

interface MessageDialogMobxProps {
    messageId?: string,
    setMessageId: (messageId?: string) => void
}

type MessageDialogProps = MessageDialogMobxProps & WithMobileDialog;

const _MessageDialog: FunctionComponent<MessageDialogProps> = ({
    messageId,
    setMessageId,
    fullScreen
}) => (
    <Dialog open={Boolean(messageId)}
            onClose={() => setMessageId(undefined)}
            fullScreen={fullScreen}
            fullWidth
            maxWidth="md"
    >
        <DialogTitle>
            <IconButton onClick={() => setMessageId(undefined)}
                        style={{float: "right"}}
            >
                <Close/>
            </IconButton>
        </DialogTitle>
        <DialogContent>
            {messageId && <MessagesListItem messageId={messageId} fullWidth onMenuItemClick={() => setMessageId(undefined)}/>}
        </DialogContent>
    </Dialog>
);

const mapMobxToProps: MapMobxToProps<MessageDialogMobxProps> = ({messageDialog}) => ({
    messageId: messageDialog.messageId,
    setMessageId: messageDialog.setMessageId
});

export const MessageDialog = withMobileDialog()(
    inject(mapMobxToProps)(observer(_MessageDialog) as FunctionComponent)
);

