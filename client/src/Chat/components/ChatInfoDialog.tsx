import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Button,
    Card,
    CardHeader,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Theme,
} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import randomColor from "randomcolor";
import {ChatDescription} from "./ChatDescription";
import {ChatMenu} from "./ChatMenu";
import {getAvatarLabel} from "../utils";
import {Avatar} from "../../Avatar";
import {AllChatParticipantsList} from "../../ChatParticipant";
import {useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";
import {ChatType} from "../../api/types/response";

const useStyles = makeStyles((theme: Theme) => createStyles({
    chatInfoContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        flexDirection: "column"
    },
    chatInfoCard: {
        marginBottom: theme.spacing(1),
        width: "100%"
    },
    dialogContentRoot: {
        padding: 0
    }
}));

export const ChatInfoDialog: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChatId
        },
        chatInfoDialog: {
            chatInfoDialogOpen,
            setChatInfoDialogOpen
        },
        entities: {
            chats: {
                findById: findChat
            }
        }
    } = useStore();
    const {l} = useLocalization();
    const {fullScreen} = useMobileDialog();
    const classes = useStyles();

    if (!selectedChatId) {
        return null;
    }

    const chat = findChat(selectedChatId);

    if (chat.type === ChatType.DIALOG) {
        return null;
    }

    const avatarLetter = getAvatarLabel(chat.name);
    const color = randomColor({seed: chat.id});

    return (
        <Dialog open={chatInfoDialogOpen}
                onClose={() => setChatInfoDialogOpen(false)}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="xs"
        >
            <DialogTitle>
                <CardHeader title={l("chat.info")}
                            action={<ChatMenu/>}
                />
            </DialogTitle>
            <DialogContent classes={{
                root: classes.dialogContentRoot
            }}>
                <div className={classes.chatInfoContainer}>
                    <Card className={classes.chatInfoCard}>
                        <CardHeader avatar={<Avatar avatarLetter={avatarLetter}
                                                    avatarColor={color}
                                                    avatarUri={chat.avatarUri}
                                                    width={64}
                                                    height={64}
                                                    avatarId={chat.avatarId}
                        />}
                                    title={chat.name}

                        />
                    </Card>
                    <div className={classes.chatInfoCard}>
                        <ChatDescription/>
                    </div>
                    <div className={classes.chatInfoCard}>
                        <AllChatParticipantsList/>
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        color="secondary"
                        onClick={() => setChatInfoDialogOpen(false)}
                >
                    {l("close")}
                </Button>
            </DialogActions>
        </Dialog>
    );
});
