import {LINK, TextMatchTransformer} from "@lexical/markdown";
import {$isBeautifulMentionNode, BeautifulMentionNode} from "lexical-beautiful-mentions";

export const MENTION: TextMatchTransformer = {
	...LINK,
	dependencies: [BeautifulMentionNode],
	export: node => {
		if (!$isBeautifulMentionNode(node)) {
			return null;
		}

		const data = node.getData();

		return `[${node.getTextContent()}](${data?.url})`;
	}
}