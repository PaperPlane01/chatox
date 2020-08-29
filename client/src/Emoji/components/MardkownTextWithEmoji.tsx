import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import ReactMarkdown from "react-markdown";
import {useEmojiParser} from "../hooks";
import {MessageEmoji} from "../../api/types/response";

const remarkBreaks = require("remark-breaks");

interface MardkownTextWithEmojiProps {
    text: string,
    emojiData?: MessageEmoji,
    disableRemarkBreaks?: boolean
}

export const MarkdownTextWithEmoji: FunctionComponent<MardkownTextWithEmojiProps> = observer(({text, emojiData, disableRemarkBreaks = false}) => {
    const {parseEmoji} = useEmojiParser();

    return (
        <ReactMarkdown source={text}
                       plugins={disableRemarkBreaks ? [] : [remarkBreaks]}
                       renderers={{
                           text: props => {
                               return (
                                   <Fragment>
                                       {parseEmoji(props.value as string, emojiData)}
                                   </Fragment>
                               )
                           }
                       }}
        />
    )
})
