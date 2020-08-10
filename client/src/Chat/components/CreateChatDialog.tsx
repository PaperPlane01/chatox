import React, {Fragment, FunctionComponent, KeyboardEvent} from "react";
import {observer} from "mobx-react";
import {
    Button,
    Chip,
    CircularProgress,
    createStyles,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    makeStyles,
    TextField,
    Typography,
    withMobileDialog
} from "@material-ui/core";
import {useLocalization, useRouter, useStore} from "../../store";
import {Routes} from "../../router";
import {containsNotUndefinedValues} from "../../utils/object-utils";
import {MakrdownPreviewDialog, OpenMarkdownPreviewDialogButton} from "../../Markdown";

const useStyles = makeStyles(theme => createStyles({
    errorLabel: {
        color: theme.palette.error.main
    }
}));

export const CreateChatDialog: FunctionComponent = withMobileDialog()(observer(({fullScreen}) => {
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
            addTag,
            removeTagByIndex,
            reset,
            createChat,
            setCreateChatDialogOpen
        }
    } = useStore();
    const routerStore = useRouter();
    const {l} = useLocalization();
    const classes = useStyles();

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

    const handleTagsInputKeydown = (event: KeyboardEvent) => {
        if (currentTag.trim().length !== 0) {
            if (event.keyCode === 13 || event.keyCode === 32) {
                addTag(currentTag);
                setCurrentTag("");
            }
        } else if (event.keyCode === 8 || event.keyCode === 46) {
            removeTagByIndex(createChatForm.tags.length - 1);
        }
    };

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
                           rowsMax={20}
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
                <TextField label={l("chat.tags")}
                           value={currentTag}
                           onChange={event => setCurrentTag(event.target.value)}
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
                           InputProps={{
                               startAdornment: (
                                   <InputAdornment position="start">
                                       <Fragment>
                                           {createChatForm.tags.map((tag, index) => (
                                               <Chip onDelete={() => removeTagByIndex(index)}
                                                     label={tag}
                                                     key={tag}
                                               />
                                           ))}
                                       </Fragment>
                                   </InputAdornment>
                               ),
                               onKeyDown: event => handleTagsInputKeydown(event)
                           }}
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
            <MakrdownPreviewDialog text={createChatForm.description || ""}/>
        </Dialog>
    );
})) as FunctionComponent;
