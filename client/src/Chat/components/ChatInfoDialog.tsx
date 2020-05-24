import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
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
    withMobileDialog,
    WithMobileDialog
} from "@material-ui/core";
import randomColor from "randomcolor";
import {ChatDescription} from "./ChatDescription";
import {ChatParticipantsList} from "./ChatParticipantsList";
import {ChatMenu} from "./ChatMenu";
import {ChatOfCurrentUserEntity} from "../types";
import {getAvatarLabel} from "../utils";
import {Avatar} from "../../Avatar";
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";

interface ChatInfoDialogMobxProps {
    chatInfoDialogOpen: boolean,
    setChatInfoDialogOpen: (chatInfoDialogOpen: boolean) => void,
    selectedChatId?: string,
    findChat: (chatId: string) => ChatOfCurrentUserEntity
}

type ChatInfoDialogProps = ChatInfoDialogMobxProps & Localized & WithMobileDialog;

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

const _ChatInfoDialog: FunctionComponent<ChatInfoDialogProps> = ({
    chatInfoDialogOpen,
    selectedChatId,
    setChatInfoDialogOpen,
    findChat,
    fullScreen,
    l
}) => {
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
                                                    width={80}
                                                    height={80}
                        />}
                                    title={chat.name}

                        />
                    </Card>
                    <div className={classes.chatInfoCard}>
                        <ChatDescription/>
                    </div>
                    <div className={classes.chatInfoCard}>
                        <ChatParticipantsList/>
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
};

const mapMobxToProps: MapMobxToProps<ChatInfoDialogMobxProps> = ({chatInfoDialog, chat, entities}) => ({
    chatInfoDialogOpen: chatInfoDialog.chatInfoDialogOpen,
    setChatInfoDialogOpen: chatInfoDialog.setChatInfoDialogOpen,
    selectedChatId: chat.selectedChatId,
    findChat: entities.chats.findById
});

export const ChatInfoDialog = localized(
    withMobileDialog()(
        inject(mapMobxToProps)(observer(_ChatInfoDialog))
    )
) as FunctionComponent;
