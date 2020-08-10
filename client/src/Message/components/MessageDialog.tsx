import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Dialog, DialogContent, DialogTitle, IconButton, withMobileDialog} from "@material-ui/core";
import {Close} from "@material-ui/icons";
import {MessagesListItem} from "./MessagesListItem";
import {useStore} from "../../store";

export const MessageDialog: FunctionComponent = withMobileDialog()(observer(({fullScreen}) => {
    const {
        messageDialog: {
            messageId,
            setMessageId
        }
    } = useStore();

    return (
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
})) as FunctionComponent;
