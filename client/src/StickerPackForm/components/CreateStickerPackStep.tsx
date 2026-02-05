import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {StickerPackFormFields} from "./StickerPackFormFields";
import {getCreateStickerPackText} from "../utils";

export const CreateStickerPackStep: FunctionComponent = observer(() =>
	<StickerPackFormFields context="stickerPackCreation" getErrorText={getCreateStickerPackText}/>
);
