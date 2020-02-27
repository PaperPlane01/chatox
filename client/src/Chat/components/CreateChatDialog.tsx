import React, {FunctionComponent, Fragment, KeyboardEvent} from "react";
import {inject, observer} from "mobx-react";
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
    withMobileDialog,
    WithMobileDialog
} from "@material-ui/core";
import {CreateChatFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {ApiError} from "../../api";
import {ChatResponse} from "../../api/types/response";
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";
import {Routes} from "../../router";

interface CreateChatDialogMobxProps {
    createChatForm: CreateChatFormData,
    formErrors: FormErrors<CreateChatFormData>,
    pending: boolean,
    currentTag: string,
    submissionError?: ApiError,
    checkingSlugAvailability: boolean,
    createChatDialogOpen: boolean,
    createdChat?: ChatResponse,
    createChat: () => void,
    setCreateChatDialogOpen: (createChatDialogOpen: boolean) => void,
    setFormValue: <Key extends keyof CreateChatFormData>(key: Key, value: CreateChatFormData[Key]) => void,
    addTag: (tag: string) => void,
    removeTagByIndex: (index: number) => void,
    setCurrentTag: (tag: string) => void,
    reset: () => void,
    routerStore?: any
}

type CreateChatDialogProps = CreateChatDialogMobxProps & WithMobileDialog & Localized;

const useStyles = makeStyles(theme => createStyles({
    errorLabel: {
        color: theme.palette.error.main
    }
}));

const _CreateChatDialog: FunctionComponent<CreateChatDialogProps> = ({
    createChatForm,
    formErrors,
    currentTag,
    submissionError,
    pending,
    createChatDialogOpen,
    checkingSlugAvailability,
    createdChat,
    createChat,
    setCreateChatDialogOpen,
    setFormValue,
    addTag,
    removeTagByIndex,
    setCurrentTag,
    reset,
    fullScreen,
    l,
    routerStore
}) => {
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
                           error={Boolean(formErrors.tags)}
                           helperText={formErrors.tags && l(formErrors.tags)}
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
        </Dialog>
    );
};

const mapMobxToProps: MapMobxToProps<CreateChatDialogMobxProps> = ({chatCreation, store}) => ({
    createChatForm: chatCreation.createChatForm,
    formErrors: chatCreation.formErrors,
    pending: chatCreation.pending,
    createChatDialogOpen: chatCreation.createChatDialogOpen,
    createdChat: chatCreation.createdChat,
    checkingSlugAvailability: chatCreation.checkingSlugAvailability,
    setFormValue: chatCreation.setFormValue,
    createChat: chatCreation.createChat,
    setCreateChatDialogOpen: chatCreation.setCreateChatDialogOpen,
    submissionError: chatCreation.submissionError,
    currentTag: chatCreation.currentTag,
    addTag: chatCreation.addTag,
    removeTagByIndex: chatCreation.removeTagByIndex,
    setCurrentTag: chatCreation.setCurrentTag,
    reset: chatCreation.reset,
    routerStore: store
});

export const CreateChatDialog = withMobileDialog()(
    localized(
        inject(mapMobxToProps)(observer(_CreateChatDialog))
    ) as FunctionComponent
);
