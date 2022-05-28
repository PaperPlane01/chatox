import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import ReactMarkdown from "react-markdown";
import {useEmojiParser} from "../hooks";
import {MessageEmoji} from "../../api/types/response";
import {Typography} from "@mui/material";

const remarkBreaks = require("remark-breaks");

interface MardkownTextWithEmojiProps {
    text: string,
    emojiData?: MessageEmoji,
    disableRemarkBreaks?: boolean
}

export const MarkdownTextWithEmoji: FunctionComponent<MardkownTextWithEmojiProps> = observer(({text, emojiData, disableRemarkBreaks = false}) => {
    const {parseEmoji} = useEmojiParser();

    return (
        <ReactMarkdown children={text}
                       remarkPlugins={disableRemarkBreaks ? [] : [remarkBreaks]}
                       components={{
                           p: ({node}) => {
                               return (
                                   <Typography paddingBottom={0}>
                                       {parseEmoji((node.children[0] as any).value, emojiData)}
                                   </Typography>
                               )
                           }
                       }}
        />
    );
})
