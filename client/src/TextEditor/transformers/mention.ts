import {LINK, TextMatchTransformer} from "@lexical/markdown";
import {$isBetterMentionNode, BetterMentionNode} from "lexical-better-mentions";

export const MENTION: TextMatchTransformer = {
	...LINK,
	dependencies: [BetterMentionNode],
	export: node => {
		if (!$isBetterMentionNode(node)) {
			return null;
		}

		const data = node.getData();

		return `[${node.getTextContent()}](${data?.url})`;
	}
}