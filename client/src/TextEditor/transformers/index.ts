import {TRANSFORMERS as DEFAULT_TRANSFORMERS} from "@lexical/markdown";
import {MENTION} from "./mention";

export const TRANSFORMERS = [
	...DEFAULT_TRANSFORMERS,
	MENTION
];
