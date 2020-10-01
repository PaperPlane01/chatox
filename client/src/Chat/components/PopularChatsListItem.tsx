import React, {FunctionComponent, Fragment} from "react";
import {observer} from "mobx-react";
import {Card, CardHeader, CardContent, CardActions, createStyles, makeStyles, Typography} from "@material-ui/core";
import ReactMarkdown from "react-markdown";
import randomColor from "randomcolor";
import {useStore, useLocalization, useRouter} from "../../store/hooks";
import {Routes} from "../../router";
import {Avatar} from "../../Avatar/components";
import {getAvatarLabel} from "../utils";
import {useLuminosity} from "../../utils/hooks";

const {Link} = require("mobx-router");
const breaks = require("remark-breaks");

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
                      view={Routes.chatPage}
                      params={{slug: chat.slug || chat.id}}
                      store={routerStore}
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
                <ReactMarkdown plugins={[breaks]}>
                    {chat.description}
                </ReactMarkdown>
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
    )
});
