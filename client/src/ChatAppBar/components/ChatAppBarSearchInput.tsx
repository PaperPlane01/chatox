import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton, InputAdornment, TextField, makeStyles, createStyles} from "@material-ui/core";
import {Close, Search} from "@material-ui/icons";
import {useLocalization, useStore} from "../../store";

const useClasses = makeStyles(() => createStyles({
    inputRoot: {
        color: "inherit"
    },
    inputUnderline: {
        borderBottomColor: "inherit",
        "&:before": {
            borderBottomColor: "inherit"
        },
        "&:hover:before": {
            borderBottomColor: "inherit"
        },
        "&:hover": {
            borderBottomColor: "inherit"
        },
        "&:hover:not(.Mui-Disabled):before": {
            "borderBottomColor": "inherit"
        },
        "&:after": {
            borderBottomColor: "inherit"
        }
    }
}));

export const ChatAppBarSearchInput: FunctionComponent = observer(() => {
    const {
        messagesSearch: {
            query,
            setQuery,
            reset
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useClasses();

    return (
        <TextField placeholder={l("common.search")}
                   value={query}
                   fullWidth
                   style={{
                       color: "inherit"
                   }}
                   InputProps={{
                       startAdornment: (
                           <InputAdornment position="start">
                               <Search/>
                           </InputAdornment>
                       ),
                       endAdornment: (
                           <InputAdornment position="end">
                               <IconButton onClick={reset}
                                           color="inherit"
                               >
                                   <Close/>
                               </IconButton>
                           </InputAdornment>
                       ),
                       classes: {
                           root: classes.inputRoot,
                           underline: classes.inputUnderline
                       }
                   }}
                   onChange={event => setQuery(event.target.value)}
        />
    );
});