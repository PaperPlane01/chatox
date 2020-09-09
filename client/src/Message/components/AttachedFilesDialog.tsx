import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Dialog, DialogContent, DialogActions, DialogTitle, List} from "@material-ui/core";
import {CreateMessageFormMediaAttachment} from "./CreateMessageFormMediaAttachment";
import {useLocalization, useStore} from "../../store/hooks";
import {useMobileDialog} from "../../utils/hooks";

export const AttachedFilesDialog: FunctionComponent = observer(() => {
    const {
        messageUploads: {
            messageAttachmentsFiles,
            attachedFilesDialogOpen,
            setAttachedFilesDialogOpen
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
                        <CreateMessageFormMediaAttachment fileContainer={fileContainer}
                                                          key={fileContainer.localId}
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
    )
})
