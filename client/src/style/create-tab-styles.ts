import {createStyles, makeStyles} from "@mui/styles";
import {Theme} from "@mui/material";
import {commonStyles} from "./common-styles";

export const createTabStyles = () => makeStyles((theme: Theme) => createStyles({
    undecoratedLink: commonStyles.undecoratedLink,
    tabsContainer: {
        display: "flex"
    },
    tabs: {
        borderRight: `1px solid ${theme.palette.divider}`,
    },
    fullWidth: {
        width: "80%"
    },
    flexContainer: {
        display: "flex",
        alignItems: "flex-start"
    }
}));