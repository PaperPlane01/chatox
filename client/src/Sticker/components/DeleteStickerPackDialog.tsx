import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	CircularProgress,
	Checkbox,
	FormGroup,
	FormControlLabel,
	FormHelperText
} from "@mui/material";
import {useLocalization, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {useMobileDialog} from "../../utils/hooks";
import {HasRole} from "../../Authorization";

export const DeleteStickerPackDialog: FunctionComponent = observer(() => {
	const {
		stickerPackDeletion: {
			deleteStickerPackDialogOpen,
			pending,
			stickerPackId,
			formValues,
			formErrors,
			setDeleteStickerPackDialogOpen,
			setFormValue,
			submitForm
		}
	} = useStore();
	const {l} = useLocalization();
	const stickerPack = useEntityById("stickerPacks", stickerPackId);
	const {fullScreen} = useMobileDialog();

	if (!stickerPack) {
		return null;
	}

	return (
		<Dialog open={deleteStickerPackDialogOpen}
				fullScreen={fullScreen}
				fullWidth
				maxWidth="md"
				onClose={() => setDeleteStickerPackDialogOpen(false)}
		>
			<DialogTitle>
				{l("sticker.pack.delete.with-name", {stickerPackName: stickerPack.name})}
			</DialogTitle>
			<DialogContent>
				<FormGroup>
					<FormControlLabel control={(
						<Checkbox checked={formValues.consent}
								  onChange={event => setFormValue("consent", event.target.checked)}
						/>
					)}
									  label={l("sticker.pack.delete.consent")}
					/>
					{formErrors.consent && (
						<FormHelperText>
							{l(formErrors.consent)}
						</FormHelperText>
					)}
					<HasRole role="ROLE_ADMIN">
						<FormControlLabel control={(
							<Checkbox checked={formValues.deleteMessages}
									  onChange={event => setFormValue("deleteMessages", event.target.checked)}
							/>
						)}
										  label={l("sticker.pack.delete.delete-messages")}
						/>
					</HasRole>
				</FormGroup>
			</DialogContent>
			<DialogActions>
				<Button variant="outlined"
						color="secondary"
						disabled={pending}
						onClick={() => setDeleteStickerPackDialogOpen(false)}
				>
					{l("cancel")}
				</Button>
				<Button variant="contained"
						color="primary"
						onClick={submitForm}
						disabled={pending}
				>
					{pending && <CircularProgress size={15} color="primary"/>}
					{l("sticker.pack.delete")}
				</Button>
			</DialogActions>
		</Dialog>
	);
});
