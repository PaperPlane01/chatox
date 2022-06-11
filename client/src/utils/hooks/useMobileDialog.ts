import {useMediaQuery, useTheme} from "@mui/material";

export const useMobileDialog = (): {fullScreen: boolean} => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    return {fullScreen};
};
