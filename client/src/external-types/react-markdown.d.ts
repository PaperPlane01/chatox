import "react-markdown";
import {Options} from "react-markdown";
import {Components, Element} from "react-markdown/lib";
import {ComponentType, ReactElement} from "react";

type EmojiComponentProps = {
	node: Element
} & Options;

type EmojiComponent = ComponentType<EmojiComponentProps>

interface ExtendedOptions extends Options {
	components?: Components & {
		emoji?: EmojiComponent
	}
}

declare module "react-markdown" {
	export default function ReactMarkdown(options: ExtendedOptions): ReactElement
    export function MarkdownAsync(options: ExtendedOptions): ReactElement
    export function MarkdownHooks(options: ExtendedOptions): ReactElement
}
