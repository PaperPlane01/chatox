import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Card, CardActions, CardContent, CardHeader} from "@mui/material";
import {StickersGridList} from "./StickersGridList";
import {StickerPackMenu} from "./StickerPackMenu";
import {StickerPackInstallationButtons} from "./StickerPackInstallationButtons";
import {useLocalization} from "../../store";
import {useEntityById} from "../../entities";
import {HasAnyRole} from "../../Authorization";

interface StickerPackCardProps {
	stickerPackId?: string
}

export const StickerPackCard: FunctionComponent<StickerPackCardProps> = observer(({
	stickerPackId
}) => {
	const {l} = useLocalization();
	const stickerPack = useEntityById("stickerPacks", stickerPackId);

	if (!stickerPack) {
		return null;
	}

	return (
		<Card>
			<CardHeader title={l("sticker.pack.with-name", {name: stickerPack.name})}
						action={<StickerPackMenu stickerPackId={stickerPack.id}/>}
			/>
			<CardContent>
				<StickersGridList stickerPackId={stickerPack.id}/>
			</CardContent>
			<HasAnyRole roles={["ROLE_ANONYMOUS_USER", "ROLE_USER"]}>
				<CardActions>
					<StickerPackInstallationButtons stickerPackId={stickerPack.id}/>
				</CardActions>
			</HasAnyRole>
		</Card>
	);
});
