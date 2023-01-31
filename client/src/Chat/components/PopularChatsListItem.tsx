import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Card, CardActions, CardContent, CardHeader, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import randomColor from "randomcolor";
import {Link} from "mobx-router";
import {useLocalization, useRouter, useStore} from "../../store";
import {Routes} from "../../router";
import {Avatar} from "../../Avatar";
import {getAvatarLabel} from "../utils";
import {useLuminosity} from "../../utils/hooks";

interface PopularChatsListItemProps {
    chatId: string
}

const useStyles = makeStyles(() => createStyles({
    tagTypography: {
        textDecoration: "underline",
        cursor: "pointer"
    },
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    }
}))

export const PopularChatsListItem: FunctionComponent<PopularChatsListItemProps> = observer(({chatId}) => {
    const {
        entities: {
            chats: {
                findById: findChat
            }
        }
    } = useStore();
    const {l} = useLocalization();
    const routerStore = useRouter();
    const classes = useStyles();
    const luminosity = useLuminosity();

    const chat = findChat(chatId);
    const chatColor = randomColor({seed: chat.id, luminosity});

    return (
        <Card>
            <CardHeader title={
                <Link className={classes.undecoratedLink}
                      route={Routes.chatPage}
                      params={{slug: chat.slug || chat.id}}
                      router={routerStore}
                >
                    <Typography style={{color: chatColor}}>
                        <strong>{chat.name}</strong>
                    </Typography>
                </Link>
            }
                        subheader={l(
                            "chat.number-of-participants",
                            {numberOfParticipants: chat.participantsCount, onlineParticipantsCount: `${chat.onlineParticipantsCount}`}
                        )}
                        avatar={
                            <Avatar avatarLetter={getAvatarLabel(chat.name)}
                                    avatarColor={chatColor}
                                    avatarId={chat.avatarId}
                            />
                        }
            />
            <CardContent>
                {chat.description && (
                    <ReactMarkdown children={chat.description}
                                   remarkPlugins={[remarkBreaks]}
                    />
                )}
            </CardContent>
            {chat.tags.length !== 0 && (
                <CardActions>
                    <Typography>
                        {chat.tags.map(tag => (
                            <Fragment>
                                <span key={tag} className={classes.tagTypography}>#{tag}</span>
                                {" "}
                            </Fragment>
                        ))}
                    </Typography>
                </CardActions>
            )}
        </Card>
    );
});
