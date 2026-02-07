import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CreateStickerDialog} from "./CreateStickerDialog";
import {EditStickerDialog} from "./EditStickerDialog";
import {StickerPackFormFields} from "./StickerPackFormFields";
import {getCreateStickerPackText} from "../utils";
import {useStore} from "../../store";

export const CreateStickerPackStep: FunctionComponent = observer(() => {
	const {
		stickerPackCreation: {
			editedSticker,
			stickerUnderCreation
		}
	} = useStore();

	return (
		<Fragment>
			<StickerPackFormFields context="stickerPackCreation" getErrorText={getCreateStickerPackText}/>
			{stickerUnderCreation && (
				<CreateStickerDialog stickerContainer={stickerUnderCreation} context="stickerPackCreation"/>
			)}
			{editedSticker && <EditStickerDialog stickerContainer={editedSticker} context="stickerPackCreation"/>}
		</Fragment>
	)
});
