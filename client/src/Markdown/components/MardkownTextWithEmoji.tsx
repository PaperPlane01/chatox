import React, {Fragment, FunctionComponent, KeyboardEvent, MouseEvent} from "react";
import {observer} from "mobx-react";
import {Theme, Typography} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import ReactMarkdown, {Components, MarkdownHooks} from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import {EmojiData} from "emoji-mart";
import {emojiPlugin, emojiPluginAsync} from "../plugins";
import {MessageEmoji} from "../../api/types/response";
import {rootStore, useStore} from "../../store";
import {createBlockquoteStyles} from "../../style";

interface MarkdownTextWithEmojiProps {
    text: string,
    emojiData?: MessageEmoji,
    disableRemarkBreaks?: boolean,
    renderParagraphsAsSpan?: boolean,
    renderLinksAsPlainText?: boolean,
    renderQuotesAsPlainText?: boolean,
    renderHeadersAsPlainText?: boolean,
    renderCodeAsPlainText?: boolean
}

const useStyles = makeStyles()((theme: Theme) => ({
    blockquote: createBlockquoteStyles(theme)
}));

const DISALLOWED_TAGS = new Set<string>([
    "img",
    "table",
    "th",
    "tr",
    "td",
    "input"
]);

export const MarkdownTextWithEmoji: FunctionComponent<MarkdownTextWithEmojiProps> = observer(({
    text,
    emojiData,
    disableRemarkBreaks = false,
    renderParagraphsAsSpan = false,
    renderLinksAsPlainText = false,
    renderHeadersAsPlainText = false,
    renderQuotesAsPlainText = false,
    renderCodeAsPlainText = false
}) => {
    const {
        emoji: {
            selectedEmojiSet
        }
    } = useStore();
    const {classes} = useStyles();

    const TargetMarkdownComponent = emojiData ? ReactMarkdown : MarkdownHooks;
    const targetEmojiPlugin = emojiData ? emojiPlugin(emojiData) : emojiPluginAsync();
    const plugins = disableRemarkBreaks
        ? [targetEmojiPlugin, remarkGfm]
        : [remarkBreaks, targetEmojiPlugin, remarkGfm];

    return (
        <TargetMarkdownComponent
            remarkPlugins={plugins}
            allowElement={element => !DISALLOWED_TAGS.has(element.tagName)}
            components={{
                p: renderParagraph(renderParagraphsAsSpan),
                a: renderLink(renderLinksAsPlainText),
                blockquote: renderQuote(renderQuotesAsPlainText, classes.blockquote),
                h1: renderHeader(renderHeadersAsPlainText, "h1"),
                h2: renderHeader(renderHeadersAsPlainText, "h2"),
                h3: renderHeader(renderHeadersAsPlainText, "h3"),
                h4: renderHeader(renderHeadersAsPlainText, "h4"),
                h5: renderHeader(renderHeadersAsPlainText, "h5"),
                h6: renderHeader(renderHeadersAsPlainText, "h6"),
                code: renderCode(renderCodeAsPlainText),
                pre: renderPre(renderCodeAsPlainText),
                del: renderDel,
                emoji: ({node}) => {
                    const properties = node.properties as unknown as EmojiData;

                    return (
                        <em-emoji
                            size="20"
                            id={properties.id}
                            native={properties.native}
                            set={selectedEmojiSet}
                        />
                    );
                }
        }}
        >
            {text}
        </TargetMarkdownComponent>
    );
});

const renderParagraph = (renderAsSpan: boolean): Components["p"] => ({node, ...props}) => {
    if (renderAsSpan) {
        return <span {...props}/>
    } else {
        return <Typography {...props}/>;
    }
};

const renderLink = (renderAsPlainText: boolean): Components["a"] => ({node, ...props}) => {
    if (renderAsPlainText) {
        return props?.children
            ? <Fragment>{props.children}</Fragment>
            : <Fragment>{props.href ?? ""}</Fragment>;
    } else {
        const handleLinkClick = (event: MouseEvent | KeyboardEvent, href: string): void => {
            if (!href.startsWith("/") && !href.startsWith(import.meta.env.VITE_PUBLIC_URL)) {
                return;
            }

            event.preventDefault();
            window.history.pushState(null, "", href);

            rootStore.restartRouter();
        };

        return (
            <a {...props}
               onClick={event => handleLinkClick(event, props.href ?? "/")}
               onKeyDown={event => {
                   if (event.key === "Enter") {
                       handleLinkClick(event, props.href ?? "/")
                   }
               }}
            />
        );
    }
};

const renderQuote = (
    renderAsPlainText: boolean,
    className: string
): Components["blockquote"] => ({node, ...props}) => {
    if (renderAsPlainText) {
        return <Fragment>{props.children}</Fragment>;
    } else {
        return <blockquote {...props} className={className}/>;
    }
};

const renderHeader = (
    renderAsPlainText: boolean,
    variant: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
): Components["h1"] => ({node, ...props}) => {
    if (renderAsPlainText) {
        return <Fragment>{props.children}</Fragment>;
    } else {
        return (
            <Typography variant={variant}
                        {...props}
            />
        );
    }
};

const renderCode = (renderAsPlainText: boolean): Components["code"] => ({node, ...props}) => {
    if (renderAsPlainText) {
        return <Fragment>{props.children}</Fragment>;
    } else {
        return <code {...props}/>;
    }
};

const renderPre = (renderAsPlainText: boolean): Components["pre"] => ({node, ...props}) => {
    if (renderAsPlainText) {
        return <Fragment>{props.children}</Fragment>;
    } else {
        return <pre {...props}/>;
    }
};

const renderDel: Components["del"] = ({node, ...props}) => {
    return <del {...props}/>;
};
