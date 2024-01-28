import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {Theme, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import {Element} from "hast";
import {useEmojiParser} from "../hooks";
import {MessageEmoji} from "../../api/types/response";
import {EmojiKeyProviderFunction} from "../internal/ParseEmojiOptions";

interface MarkdownTextWithEmojiProps {
    text: string,
    emojiData?: MessageEmoji,
    disableRemarkBreaks?: boolean,
    uniqueId?: string
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    blockquote: {
        marginBlockStart: 0,
        marginBlockEnd: 0,
        marginInlineStart: 0,
        marginInlineEnd: 0,
        paddingLeft: theme.spacing(4),
        borderLeft: `${theme.spacing(0.5)} ${theme.palette.primary.main} solid`,
        position: "relative",
        "&::before": {
            content: "'\u201C'",
            position: "absolute",
            fontSize: "4em",
            color: theme.palette.primary.main,
            left: 10,
            top: -20
        },
        "&::after": {
            content: "''"
        }
    }
}));

export const MarkdownTextWithEmoji: FunctionComponent<MarkdownTextWithEmojiProps> = observer(({
    text,
    emojiData,
    disableRemarkBreaks = false,
    uniqueId
}) => {
    const {parseEmoji} = useEmojiParser();
    const classes = useStyles();

    const processEmoji = (node: Element, props: any): ReactNode | ReactNode[] => node.children.map(child => {
        if (child.type === "text") {
            const keyProvider: EmojiKeyProviderFunction | undefined = uniqueId
                ? emoji => `${uniqueId}-${emoji.colons}-${child.position?.start.column}`
                : undefined;

            return parseEmoji(child.value, emojiData, child.position, keyProvider);
        } else {
            return (
                <Fragment {...props}
                          children={props.children.filter((child: any) => typeof child !== "string")}
                />
            );
        }
    });

    return (
        <ReactMarkdown remarkPlugins={!disableRemarkBreaks ? [remarkBreaks] : []}
                       components={{
                           p: ({node, ...props}) => (
                               <Typography>
                                   {processEmoji(node, props)}
                               </Typography>
                           ),
                           li: ({node, ...props}) => (
                               <li>
                                   {processEmoji(node, props)}
                               </li>
                           ),
                           em: ({node, ...props}) => (
                               <i>
                                   {processEmoji(node, props)}
                               </i>
                           ),
                           i: ({node, ...props}) => (
                               <i>
                                   {processEmoji(node, props)}
                               </i>
                           ),
                           b: ({node, ...props}) => (
                               <b>
                                   {processEmoji(node, props)}
                               </b>
                           ),
                           a: ({node, ...props}) => (
                               <a {...props}>
                                   {processEmoji(node, props.children)}
                               </a>
                           ),
                           strong: ({node, ...props}) => (
                               <strong>
                                   {processEmoji(node, props)}
                               </strong>
                           ),
                           h1: ({node, ...props}) => (
                               <h1>
                                   {processEmoji(node, props)}
                               </h1>
                           ),
                           h2: ({node, ...props}) => (
                               <h2>
                                   {processEmoji(node, props)}
                               </h2>
                           ),
                           h3: ({node, ...props}) => (
                               <h3>
                                   {processEmoji(node, props)}
                               </h3>
                           ),
                           h4: ({node, ...props}) => (
                               <h4>
                                   {processEmoji(node, props)}
                               </h4>
                           ),
                           blockquote: ({node, ...props}) => (
                               <blockquote className={classes.blockquote}>
                                   {processEmoji(node, props)}
                               </blockquote>
                           )
                       }}
        >
            {text}
        </ReactMarkdown>
    );
});
