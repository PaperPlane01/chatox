import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Dialog, DialogContent, DialogActions, DialogTitle, List} from "@mui/material";
import {MessageFormMediaAttachment} from "./MessageFormMediaAttachment";
import {useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";

export const AttachedFilesDialog: FunctionComponent = observer(() => {
    const {
        messageUploads: {
            messageAttachmentsFiles,
            attachedFilesDialogOpen,
            uploadPercentageMap,
            setAttachedFilesDialogOpen,
            removeAttachment
        }
    } = useStore();
    const {l} = useLocalization();
    const {fullScreen} = useMobileDialog();

    return (
        <Dialog open={attachedFilesDialogOpen}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="sm"
                onClose={() => setAttachedFilesDialogOpen(false)}
        >
            <DialogTitle>
                {l("files.attached-files")}
            </DialogTitle>
            <DialogContent>
                <List>
                    {messageAttachmentsFiles.map(fileContainer => (
                        <MessageFormMediaAttachment fileContainer={fileContainer}
                                                    key={fileContainer.localId}
                                                    onDelete={removeAttachment}
                                                    progress={uploadPercentageMap[fileContainer.localId]}
                        />
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        color="secondary"
                        onClick={() => setAttachedFilesDialogOpen(false)}
                >
                    {l("close")}
                </Button>
            </DialogActions>
        </Dialog>
    );
});
