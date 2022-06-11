import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {Typography} from "@mui/material";
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

export const MarkdownTextWithEmoji: FunctionComponent<MarkdownTextWithEmojiProps> = observer(({
    text,
    emojiData,
    disableRemarkBreaks = false,
    uniqueId
}) => {
    const {parseEmoji} = useEmojiParser();
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
    })

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
                           )
                       }}
                       children={text}
        />
    );
})
