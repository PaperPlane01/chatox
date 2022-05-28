import React, {Fragment, FunctionComponent, KeyboardEvent} from "react";
import {observer} from "mobx-react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    TextField,
    Theme,
    Typography,
} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {ChipInput} from "../../ChipInput";
import {useLocalization, useRouter, useStore} from "../../store";
import {Routes} from "../../router";
import {containsNotUndefinedValues} from "../../utils/object-utils";
import {MarkdownPreviewDialog, OpenMarkdownPreviewDialogButton} from "../../Markdown";
import {useMobileDialog} from "../../utils/hooks";

const useStyles = makeStyles((theme: Theme) => createStyles({
    errorLabel: {
        color: theme.palette.error.main
    }
}));

export const CreateChatDialog: FunctionComponent = observer(() => {
    const {
        chatCreation: {
            createdChat,
            createChatDialogOpen,
            createChatForm,
            formErrors,
            submissionError,
            pending,
            currentTag,
            checkingSlugAvailability,
            setCurrentTag,
            setFormValue,
            reset,
            createChat,
            setCreateChatDialogOpen
        }
    } = useStore();
    const routerStore = useRouter();
    const {l} = useLocalization();
    const classes = useStyles();
    const {fullScreen} = useMobileDialog();

    if (createdChat) {
        setCreateChatDialogOpen(false);
        reset();
        routerStore.router.goTo(
            Routes.chatPage,
            {slug: createdChat.slug || createdChat.id},
            routerStore,
            {}
        );
    }

    return (
        <Dialog open={createChatDialogOpen}
                onClose={() => setCreateChatDialogOpen(false)}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="md"
        >
            <DialogTitle>
                {l("chat.create-chat")}
            </DialogTitle>
            <DialogContent>
                <TextField label={l("chat.name")}
                           value={createChatForm.name}
                           onChange={event => setFormValue("name", event.target.value)}
                           fullWidth
                           margin="dense"
                           error={Boolean(formErrors.name)}
                           helperText={formErrors.name && l(formErrors.name)}
                />
                <TextField label={l("chat.description")}
                           value={createChatForm.description}
                           onChange={event => setFormValue("description", event.target.value)}
                           fullWidth
                           margin="dense"
                           error={Boolean(formErrors.description)}
                           helperText={formErrors.description && l(formErrors.description)}
                           multiline
                           rows={4}
                           maxRows={20}
                           InputProps={{
                               endAdornment: (
                                   <InputAdornment position="end">
                                       <OpenMarkdownPreviewDialogButton/>
                                   </InputAdornment>
                               )
                           }}
                />
                <TextField label={l("chat.slug")}
                           value={createChatForm.slug}
                           onChange={event => setFormValue("slug", event.target.value)}
                           fullWidth
                           margin="dense"
                           error={Boolean(formErrors.slug)}
                           helperText={formErrors.slug && l(formErrors.slug)}
                           InputProps={{
                               endAdornment: checkingSlugAvailability
                                   ? (
                                       <InputAdornment position="end">
                                           <CircularProgress size={20} color="primary"/>
                                       </InputAdornment>
                                   )
                                   : null
                           }}
                />
                <ChipInput value={createChatForm.tags}
                           onChange={value => setFormValue("tags", value as string[])}
                           onTextValueChange={setCurrentTag}
                           fullWidth
                           margin="dense"
                           error={Boolean(
                               formErrors.tags || containsNotUndefinedValues(formErrors.tagErrorsMap)
                           )}
                           helperText={
                               formErrors.tags ? l(formErrors.tags)
                                   : containsNotUndefinedValues(formErrors.tagErrorsMap)
                                       ? (
                                           <Fragment>
                                               {Object.keys(formErrors.tagErrorsMap).map(key => (
                                                   <Typography>
                                                       {formErrors.tagErrorsMap[key]
                                                       && l(formErrors.tagErrorsMap[key]!, {tag: key})}
                                                   </Typography>
                                               ))}
                                           </Fragment>
                                       )
                                       : null
                           }
                />
                {submissionError && (
                    <Typography variant="body1"
                                className={classes.errorLabel}
                    >
                        {l("error.unknown")}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        color="secondary"
                        onClick={() => setCreateChatDialogOpen(false)}
                >
                    {l("close")}
                </Button>
                <Button variant="contained"
                        color="primary"
                        onClick={createChat}
                        disabled={pending}
                >
                    {pending && <CircularProgress size={15} color="primary"/>}
                    {l("chat.create-chat")}
                </Button>
            </DialogActions>
            <MarkdownPreviewDialog text={createChatForm.description || ""}/>
        </Dialog>
    );
});
