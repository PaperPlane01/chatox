import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Card, CardActions, CardContent, CardHeader, Chip, CircularProgress, Typography} from "@mui/material";
import {ConfirmationTokenDialog} from "../../ConfirmationToken/components";
import {BaseSettingsTabProps} from "../../utils/types";
import {useLocalization, useStore} from "../../store/hooks";
import {ChatParticipantsAutoComplete} from "../../ChatParticipant/components";
import {useEntityById} from "../../entities";
import {getUserDisplayedName} from "../../User/utils/labels";
import {UserAvatar} from "../../UserAvatar/components";

export const TransferChatOwnershipForm: FunctionComponent<BaseSettingsTabProps> = observer(({
    hideHeader
}) => {
    const {
        chatOwnershipTransfer: {
            pending,
            selectedUserId,
            transferChatOwnership,
            setSelectedUserId,
            resetSelectedUserId
        },
        confirmationToken: {
            getConfirmationToken
        },
        confirmationTokenDialog: {
            openDialog
        },
        chat: {
            selectedChatId
        }
    } = useStore();
    const selectedUser = useEntityById("users", selectedUserId);
    const {l} = useLocalization();

    if (!selectedChatId) {
        return null;
    }

    const handleConfirmation = (): void => {
        if (getConfirmationToken()) {
            transferChatOwnership();
        } else {
            openDialog({onConfirmationTokenCreated: transferChatOwnership});
        }
    };

    return (
        <Fragment>
            <Card>
                {!hideHeader && <CardHeader title={l("chat.ownership.transfer")}/>}
                <CardContent>
                    <Typography>{l("chat.ownership.transfer.description")}</Typography>
                    <Typography>
                        <strong>{l("chat.ownership.transfer.warning")}</strong>
                    </Typography>
                    {selectedUser && (
                        <Chip avatar={
                            <UserAvatar user={selectedUser} width={20} height={20}/>
                        }
                              label={getUserDisplayedName(selectedUser)}
                              onDelete={resetSelectedUserId}
                              size="medium"
                        />
                    )}
                    {!selectedUser && (
                        <ChatParticipantsAutoComplete chatId={selectedChatId}
                                                      onSelect={chatParticipant => setSelectedUserId(chatParticipant.userId)}
                        />
                    )}
                </CardContent>
                <CardActions>
                    <Button variant="contained"
                            color="primary"
                            onClick={handleConfirmation}
                            disabled={pending || !selectedUserId}
                    >
                        {pending && <CircularProgress size={15} color="primary"/>}
                        {l("common.confirm")}
                    </Button>
                </CardActions>
            </Card>
            <ConfirmationTokenDialog/>
        </Fragment>
    );
});
