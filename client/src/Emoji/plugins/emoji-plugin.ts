import {Plugin, Transformer} from "unified";
import {Node} from "unist";
import {visit} from "unist-util-visit";
import {Element, Text} from "hast";
import {ElementContent, Position} from "react-markdown/lib/ast-to-react";
import createRegEmojiRegExp from "emoji-regex";
import {EmojiData} from "emoji-mart";
import {EmojiPosition, MessageEmoji} from "../../api/types/response";

interface EmojiNodeProperties {
	hName: string,
	hProperties: EmojiData
}

const NATIVE_EMOJI_REGEXP = createRegEmojiRegExp();
const COLONS_EMOJI_REGEXP = /:[^:\s]*(?:::[^:\s]*)*:/g;
const EMOJI_REGEXP = new RegExp(`(${NATIVE_EMOJI_REGEXP.source})|(${COLONS_EMOJI_REGEXP.source})`);

export const emojiPlugin = (messageEmoji?: MessageEmoji): Plugin => (): Transformer<Node, Node> => {
	return (tree: Node): void => {
		visit(tree, "text", (node: Text, index: number, parent: Element) => {
			if (messageEmoji) {
				addEmojiNodes(messageEmoji, index, node, parent);
			}
		});
	};
};

const addEmojiNodes = (
	messageEmoji: MessageEmoji,
	index: number,
	node: Text,
	parent: Element
): void => {
	if (messageEmoji.emojiPositions.length === 0) {
		return;
	}

	const nodePosition = node.position;

	if (!nodePosition) {
		return;
	}

	const emojisWithinNode = messageEmoji
		.emojiPositions
		.filter(position => position.start >= nodePosition.start.offset!
			&& position.end <= nodePosition.end.offset!);

	if (emojisWithinNode.length === 0) {
		return;
	}

	let lastPosition = 0;
	const nodes: Array<Node | Node<EmojiNodeProperties> | Text> = [];

	for (const emojiPosition of emojisWithinNode) {
		const positionWithinNode = emojiPosition.start - nodePosition.start.offset!;

		if (positionWithinNode !== lastPosition + 1) {
			nodes.push(createTextNode(
				node.value.slice(lastPosition, positionWithinNode),
				lastPosition + nodePosition.start.offset!,
				emojiPosition.start,
				nodePosition.start.line
			));
		}

		const emojiNode = createEmojiNode(
			nodePosition,
			emojiPosition,
			messageEmoji.emoji[emojiPosition.emojiId]
		);

		nodes.push(emojiNode);
		lastPosition = emojiPosition.end - nodePosition.start.offset! + 1;
	}

	if (lastPosition + 1 !== node.value.length) {
		nodes.push(createTextNode(
			node.value.slice(lastPosition, node.value.length),
			lastPosition,
			node.value.length,
			nodePosition.end.line
		));
	}

	const last = parent.children.slice(index + 1);
	parent.children = parent.children.slice(0, index);
	parent.children = parent.children.concat(nodes as unknown as ElementContent[]);
	parent.children = parent.children.concat(last);
};

const createTextNode = (value: string, start: number, end: number, line: number): Text => ({
	value,
	position: {
		start: {
			line,
			column: start + 1,
			offset: start
		},
		end: {
			line,
			column: end + 1,
			offset: end
		}
	},
	type: "text"
});

const createEmojiNode = (
	parentNodePosition: Position,
	emojiPosition: EmojiPosition,
	emojiData: EmojiData
): Node<EmojiNodeProperties> => ({
	type: "emoji",
	data: {
		hName: "emoji",
		hProperties: emojiData
	},
	position: {
		start: {
			line: parentNodePosition.start.line,
			column: emojiPosition.start + 1,
			offset: emojiPosition.start
		},
		end: {
			line: parentNodePosition.end.line,
			column: emojiPosition.end + 1,
			offset: emojiPosition.end
		}
	}
});
