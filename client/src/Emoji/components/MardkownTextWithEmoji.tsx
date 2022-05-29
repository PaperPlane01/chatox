import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {Typography} from "@mui/material";
import ReactMarkdown from "react-markdown";
import {Element} from "hast";
import {useEmojiParser} from "../hooks";
import {MessageEmoji} from "../../api/types/response";

const remarkBreaks = require("remark-breaks");

interface MardkownTextWithEmojiProps {
    text: string,
    emojiData?: MessageEmoji,
    disableRemarkBreaks?: boolean
}

export const MarkdownTextWithEmoji: FunctionComponent<MardkownTextWithEmojiProps> = observer(({
    text,
    emojiData,
    disableRemarkBreaks = false
}) => {
    const {parseEmoji} = useEmojiParser();
    const processEmoji = (node: Element, props: any): ReactNode | ReactNode[] => {
        return node.children.map(child => {
            if (child.type === "text") {
                return parseEmoji(child.value, emojiData, child.position);
            } else {
                return (
                    <Fragment {...props}
                              children={props.children.filter((child: any) => typeof child !== "string")}
                    />
                );
            }
        });
    }

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
                               <strong>
                                   {processEmoji(node, props.children)}
                               </strong>
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
                           )
                       }}
                       children={text}
        />
    );
})
