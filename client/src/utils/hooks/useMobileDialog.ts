import {useMediaQuery, useTheme} from "@material-ui/core";

export const useMobileDialog = (): {fullScreen: boolean} => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    return {fullScreen};
};
