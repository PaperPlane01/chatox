import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CircularProgress, Dialog, DialogContent, DialogTitle, IconButton} from "@material-ui/core";
import {Close} from "@material-ui/icons";
import {MessagesListItem} from "./MessagesListItem";
import {useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";
import {toJS} from "mobx";

export const MessageDialog: FunctionComponent = observer(() => {
    const {
        messageDialog: {
            pending,
            messageId,
            error,
            setMessageId
        }
    } = useStore();
    const {fullScreen} = useMobileDialog();
    console.log(toJS(error))

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
                {pending && <CircularProgress size={50} color="primary"/>}
                {messageId && !error && !pending && <MessagesListItem messageId={messageId} fullWidth onMenuItemClick={() => setMessageId(undefined)}/>}
            </DialogContent>
        </Dialog>
    );
});
