import "react-markdown";
import {Options} from "react-markdown";
import {Components, Element, ReactMarkdownProps} from "react-markdown/lib/ast-to-react";
import {ComponentType, ReactElement} from "react";

type EmojiComponentProps = {
	node: Element
} & ReactMarkdownProps;

type EmojiComponent = ComponentType<EmojiComponentProps>

interface ExtendedOptions extends Options {
	components?: Components & {
		emoji?: EmojiComponent
	}
}

declare module "react-markdown" {
	export default function ReactMarkdown(options: ExtendedOptions): ReactElement
}
