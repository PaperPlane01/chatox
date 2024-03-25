import React, {FunctionComponent, useCallback, useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {$getSelection, $isRangeSelection} from "lexical";
import {computePosition} from "@floating-ui/dom";
import {FloatingToolbar} from "./FloatingToolbar";
import {FloatingToolbarCoordinates} from "../types";
import {usePointerInteractions} from "../hooks";

export const FloatingToolbarPlugin: FunctionComponent = () => {
	const ref = useRef<HTMLDivElement>(null);
	const [coordinates, setCoordinates] = useState<FloatingToolbarCoordinates | undefined>(undefined);
	const [editor] = useLexicalComposerContext();
	const {isPointerDown, isPointerReleased} = usePointerInteractions();

	const calculatePosition = useCallback(() => {
		const selection = getSelection();
		const range = selection?.rangeCount !== 0 && selection?.getRangeAt(0);

		if (!range || !ref.current || isPointerDown) {
			return setCoordinates(undefined);
		}

		computePosition(range, ref.current, {placement: "top"})
			.then(position => setCoordinates({
				x: position.x > 0 ? position.x : 10,
				y: position.y - 10
			}))
			.catch(() => setCoordinates(undefined));
	}, [isPointerDown]);

	const $handleSelectionChange = useCallback(() => {
		if (editor.isComposing() || editor.getRootElement() !== document.activeElement) {
			setCoordinates(undefined);
			return;
		}

		const selection = $getSelection();

		if ($isRangeSelection(selection) && !selection.anchor.is(selection.focus)) {
			calculatePosition();
		} else {
			setCoordinates(undefined);
		}
	}, [editor, calculatePosition]);

	useEffect(() => {
		return editor.registerUpdateListener(
			({editorState}) => {
				editorState.read(() => $handleSelectionChange());
			}
		);
	}, [editor, $handleSelectionChange]);

	const show = coordinates !== undefined;

	useEffect(() => {
		if (!show && isPointerReleased) {
			editor.getEditorState().read(() => $handleSelectionChange());
		}
		// Adding show to the dependency array causes an issue if
		// a range selection is dismissed by navigating via arrow keys.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isPointerReleased, $handleSelectionChange, editor]);


	return createPortal(
		<FloatingToolbar
			editor={editor}
			ref={ref}
			coordinates={coordinates}
		/>,
		document.body
	);
};
