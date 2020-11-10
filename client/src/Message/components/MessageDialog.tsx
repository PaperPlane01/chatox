import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Dialog, DialogContent, DialogTitle, IconButton} from "@material-ui/core";
import {Close} from "@material-ui/icons";
import {MessagesListItem} from "./MessagesListItem";
import {useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";

export const MessageDialog: FunctionComponent = observer(() => {
    const {
        messageDialog: {
            messageId,
            setMessageId
        }
    } = useStore();
    const {fullScreen} = useMobileDialog();

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
});
