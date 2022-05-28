import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Dialog, DialogContent, DialogActions, Button} from "@mui/material";
import {useStore, useLocalization} from "../../store";
import {useMobileDialog} from "../../utils/hooks";
import {MessagesListItem} from "../../Message";

export const ReportedMessageDialog: FunctionComponent = observer(() => {
    const {
        reportedMessageDialog: {
            reportId,
            setReportId
        },
        entities: {
            reports: {
                findById: findReport
            },
            reportedMessages: {
                findById: findReportedMessage
            },
            reportedMessagesSenders: {
                findById: findReportedMessageSender
            }
        }
    } = useStore();
    const {l} = useLocalization();
    const {fullScreen} = useMobileDialog();

    if (!reportId) {
        return null;
    }

    const report = findReport(reportId);

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
