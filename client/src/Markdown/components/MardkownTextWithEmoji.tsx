import React, {FunctionComponent, MouseEvent, KeyboardEvent} from "react";
import {observer} from "mobx-react";
import {Theme, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import {Emoji, EmojiData, EmojiSet} from "emoji-mart";
import {emojiPlugin} from "../plugins";
import {MessageEmoji} from "../../api/types/response";
import {rootStore, useStore} from "../../store";
import {createBlockquoteStyles} from "../../style";

interface MarkdownTextWithEmojiProps {
    text: string,
    emojiData?: MessageEmoji,
    disableRemarkBreaks?: boolean
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    blockquote: createBlockquoteStyles(theme)
}));

export const MarkdownTextWithEmoji: FunctionComponent<MarkdownTextWithEmojiProps> = observer(({
    text,
    emojiData,
    disableRemarkBreaks = false
}) => {
    const {
        emoji: {
            selectedEmojiSet
        }
    } = useStore();
    const classes = useStyles();

    const handleLinkClick = (event: MouseEvent | KeyboardEvent, href: string): void => {
        if (!href.startsWith("/") && !href.startsWith(import.meta.env.VITE_PUBLIC_URL)) {
            return;
        }

        event.preventDefault();
        window.history.pushState(null, "", href);

        rootStore.restartRouter();
    };

    return (
        <ReactMarkdown remarkPlugins={!disableRemarkBreaks
            ? [remarkBreaks, emojiPlugin(emojiData)]
            : [emojiPlugin(emojiData)]
        }
                       allowElement={element => element.tagName !== "img"}
                       components={{
                           p: ({node, ...props}) => (
                               <Typography {...props}/>
                           ),
                           a: ({node, ...props}) => (
                              <a {...props}
                                 onClick={event => handleLinkClick(event, props.href ?? "/")}
                                 onKeyDown={event => {
                                     if (event.key === "Enter") {
                                         handleLinkClick(event, props.href ?? "/")
                                     }
                                 }}
                              />
                           ),
                           blockquote: ({node, ...props}) => (
                               <blockquote {...props} className={classes.blockquote}/>
                           ),
                           emoji: ({node}) => {
                               const properties = node.properties as unknown as EmojiData;

                               return (
                                   <Emoji size={20}
                                          emoji={properties}
                                          set={selectedEmojiSet !== "native"
                                              ? selectedEmojiSet as unknown as EmojiSet
                                              : undefined
                                          }
                                          native={selectedEmojiSet === "native"}
                                   />
                               );
                           }
                       }}
        >
            {text}
        </ReactMarkdown>
    );
});
