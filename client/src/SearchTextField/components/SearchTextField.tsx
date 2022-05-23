import React, {ChangeEvent, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {createStyles, IconButton, InputAdornment, makeStyles, TextField, TextFieldProps} from "@material-ui/core";
import {Close, Search} from "@material-ui/icons";
import {useLocalization} from "../../store";

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

type SearchTextFieldProps = TextFieldProps & {
    value: string,
    hideClearButton?: boolean,
    onClear?: () => void,
    onQueryChange?: (value: string) => void
}

export const SearchTextField: FunctionComponent<SearchTextFieldProps> = observer(({
    onQueryChange,
    onClear,
    value,
    variant,
    fullWidth,
    onChange,
    classes,
    hideClearButton,
    ...other
}) => {
    const {l} = useLocalization();
    const defaultClasses = useClasses();

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        if (onChange) {
            onChange(event);
        }

        if (onQueryChange) {
            onQueryChange(event.target.value);
        }
    }

    const handleClear = (): void => {
        if (onClear) {
            onClear();
        }
    }

    return (
        <TextField placeholder={l("common.search")}
                   value={value}
                   fullWidth
                   InputProps={{
                       startAdornment: (
                           <InputAdornment position="start">
                               <Search/>
                           </InputAdornment>
                       ),
                       endAdornment: !hideClearButton && (
                           <InputAdornment position="end">
                               <IconButton onClick={handleClear}
                                           color="inherit"
                               >
                                   <Close/>
                               </IconButton>
                           </InputAdornment>
                       ),
                       classes: {
                           root: defaultClasses.inputRoot,
                           underline: defaultClasses.inputUnderline,
                           ...classes
                       }
                   }}
                   onChange={handleChange}
                   {...other}
        />
    );
});