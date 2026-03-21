import {makeStyles} from "tss-react/mui";
import {Theme} from "@mui/material";
import {commonStyles} from "./common-styles";

export const createTabStyles = () => makeStyles()((theme: Theme) => ({
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