import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Dialog, DialogActions, DialogContent} from "@mui/material";
import {useEntities, useLocalization, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {useMobileDialog} from "../../utils/hooks";
import {MessagesListItem} from "../../Message";

export const ReportedMessageDialog: FunctionComponent = observer(() => {
    const {
        reportedMessageDialog: {
            reportId,
            setReportId
        }
    } = useStore();
    const {
        reportedMessages: {
            findById: findReportedMessage
        },
        reportedMessageSenders: {
            findById: findReportedMessageSender
        }
    } = useEntities();
    const {l} = useLocalization();
    const {fullScreen} = useMobileDialog();

    const report = useEntityById("reports", reportId);

    if (!report) {
        return null;
    }

    return (
        <Dialog open={Boolean(reportId)}
                fullWidth
                maxWidth="md"
                onClose={() => setReportId(undefined)}
                fullScreen={fullScreen}
        >
            <DialogContent>
                <MessagesListItem messageId={report.reportedObjectId}
                                  findMessageFunction={findReportedMessage}
                                  findMessageSenderFunction={findReportedMessageSender}
                                  menu={<div/>}
                                  fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        color="secondary"
                        onClick={() => setReportId(undefined)}
                >
                    {l("close")}
                </Button>
            </DialogActions>
        </Dialog>
    );
});
