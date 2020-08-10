import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Button,
    Card,
    CardHeader,
    createStyles,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    makeStyles,
    Theme,
    withMobileDialog
} from "@material-ui/core";
import randomColor from "randomcolor";
import {ChatDescription} from "./ChatDescription";
import {AllChatParticipantsList} from "./AllChatParticipantsList";
import {ChatMenu} from "./ChatMenu";
import {getAvatarLabel} from "../utils";
import {Avatar} from "../../Avatar";
import {useLocalization, useStore} from "../../store";

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

export const ChatInfoDialog: FunctionComponent = withMobileDialog()(observer(({
    fullScreen
}) => {
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
    const classes = useStyles();

    if (!selectedChatId) {
        return null;
    }

    const chat = findChat(selectedChatId);
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
    )
})) as FunctionComponent;
