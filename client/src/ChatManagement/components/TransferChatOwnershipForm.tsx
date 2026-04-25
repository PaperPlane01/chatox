import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Card, CardActions, CardContent, CardHeader, Chip, CircularProgress, Typography} from "@mui/material";
import {ConfirmationTokenDialog} from "../../ConfirmationToken/components";
import {BaseSettingsTabProps} from "../../utils/types";
import {useLocalization, useStore} from "../../store";
import {ChatParticipantsAutoComplete} from "../../ChatParticipant";
import {useEntityById} from "../../entities";
import {Avatar} from "../../Avatar";
import randomColor from "randomcolor";
import {getUserAvatarLabel, getUserDisplayedName} from "../../User/utils/labels";
import {useLuminosity} from "../../utils/hooks";

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
    const luminosity = useLuminosity();

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
                            <Avatar avatarColor={randomColor({seed: selectedUser.id, luminosity})}
                                    avatarLetter={getUserAvatarLabel(selectedUser)}
                                    width={20}
                                    height={20}
                                    avatarId={selectedUser.avatarId}
                                    avatarUri={selectedUser.externalAvatarUri}
                            />
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
