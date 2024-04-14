import {Plugin, Transformer} from "unified";
import {Node} from "unist";
import {visit} from "unist-util-visit";
import {Element, Text} from "hast";
import {ElementContent, Position} from "react-markdown/lib/ast-to-react";
import createRegEmojiRegExp from "emoji-regex";
import {EmojiData, EmojiSet, getEmojiDataFromNative} from "emoji-mart";
import allEmojiData from "emoji-mart/data/apple.json";
import {uncompress} from "emoji-mart/dist-es/utils/data";
import {EmojiPosition, MessageEmoji} from "../../api/types/response";

interface EmojiNodeProperties {
	hName: string,
	hProperties: EmojiData
}

const emojiData = allEmojiData;
uncompress(emojiData);

const NATIVE_EMOJI_REGEXP = createRegEmojiRegExp();
const COLONS_EMOJI_REGEXP = /:[^:\s]*(?:::[^:\s]*)*:/;
const EMOJI_REGEXP = new RegExp(`(${NATIVE_EMOJI_REGEXP.source})|(${COLONS_EMOJI_REGEXP.source})`, 'g');

export const emojiPlugin = (
	set: EmojiSet,
	messageEmoji?: MessageEmoji,
): Plugin => (): Transformer<Node, Node> => {
	return (tree: Node): void => {
		visit(tree, "text", (node: Text, index: number, parent: Element) => {
			if (messageEmoji) {
				addEmojiNodes(messageEmoji, index, node, parent);
			} else {
				addEmojiNodesByRegExp(set, index, node, parent);
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

	insertChildNodes(parent, index, nodes as unknown as ElementContent[]);
};

const addEmojiNodesByRegExp = (
	set: EmojiSet,
	index: number,
	node: Text,
	parent: Element
): void => {
	const nodePosition = node.position;

	if (!nodePosition) {
		return;
	}

	let lastPosition = 0;
	const nodes: Array<Node | Node<EmojiNodeProperties> | Text> = [];
	let match: RegExpMatchArray | null;
	let emojiEncountered = false;

	while ((match = EMOJI_REGEXP.exec(node.value)) !== null) {
		emojiEncountered = true;
		if (match.index !== lastPosition) {
			nodes.push(createTextNode(
				node.value.slice(lastPosition, match.index),
				lastPosition,
				match.index!,
				nodePosition.start.line
			));
		}
		console.log(match);

		const matchedValue = match[0];
		let emojiData: EmojiData | undefined;

		if (matchedValue.startsWith(":")) {
			emojiData = getEmojiDataFromColons(matchedValue, set);
		} else {
			emojiData = getEmojiDataFromNative(matchedValue, set, allEmojiData);
		}

		if (emojiData?.id) {
			const emojiNode = createEmojiNode(
				nodePosition,
				{
					start: match.index!,
					end: match.index! + matchedValue.length,
					emojiId: emojiData.id
				},
				emojiData
			);
			nodes.push(emojiNode);
			lastPosition = match.index! + matchedValue.length;
		}
	}

	if (emojiEncountered && lastPosition + 1 !== node.value.length) {
		nodes.push(createTextNode(
			node.value.slice(lastPosition, node.value.length),
			lastPosition,
			node.value.length,
			nodePosition.end.line
		));
	}

	if (emojiEncountered) {
		insertChildNodes(parent, index, nodes as unknown as ElementContent[]);
	}
};

const getEmojiDataFromColons = (colons: string, set: EmojiSet): EmojiData | undefined => {
	const code = colons.slice(1, colons.length - 1);
	const rawEmojiData: any = emojiData.emojis[code as keyof typeof emojiData.emojis];

	if (!rawEmojiData) {
		return undefined;
	}

	const unified= rawEmojiData.unified as string;
	const nativeEmoji = unified.split("-")
		.map(unicode => parseInt(unicode, 16))
		.map(unicode => String.fromCodePoint(unicode))
		.reduce((left, right) => left + right);

	return getEmojiDataFromNative(nativeEmoji, set, allEmojiData);
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

const insertChildNodes = (
	parent: Element,
	index: number,
	nodes: ElementContent[]
): void => {
	const last = parent.children.slice(index + 1);
	parent.children = parent.children.slice(0, index);
	parent.children = parent.children.concat(nodes);
	parent.children = parent.children.concat(last);
};
