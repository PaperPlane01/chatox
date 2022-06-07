import React, {ChangeEvent, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton, InputAdornment, TextField, TextFieldProps} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Close, Search} from "@mui/icons-material";
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
    },
    inputAdornmentRoot: {
        "color": "inherit"
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
    variant = "standard",
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
    };

    const handleClear = (): void => {
        if (onClear) {
            onClear();
        }
    };

    return (
        <TextField placeholder={l("common.search")}
                   value={value}
                   fullWidth
                   variant={variant as any} // https://github.com/mui/material-ui/issues/15697#issuecomment-612397854
                   InputProps={{
                       startAdornment: (
                           <InputAdornment position="start"
                                           classes={{
                                               root: defaultClasses.inputAdornmentRoot
                                           }}
                           >
                               <Search color="inherit"/>
                           </InputAdornment>
                       ),
                       endAdornment: !hideClearButton && (
                           <InputAdornment position="end"
                                           classes={{
                                               root: defaultClasses.inputAdornmentRoot
                                           }}
                           >
                               <IconButton onClick={handleClear} color="inherit" size="large">
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