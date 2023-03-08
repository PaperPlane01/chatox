import {useTheme, useMediaQuery} from "@mui/material";

export const useMessageGalleryWidthMultiplier = (): number => {
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const onMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));

    let multiplier;

    if (onSmallScreen) {
        multiplier = 0.8;
    } else if (onMediumScreen) {
        multiplier = 0.6
    } else {
        multiplier = 0.5
    }

    return multiplier;
}
