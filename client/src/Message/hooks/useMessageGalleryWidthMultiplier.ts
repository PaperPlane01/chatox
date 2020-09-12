import {useTheme, useMediaQuery} from "@material-ui/core";

export const useMessageGalleryWidthMultiplier = (): number => {
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const onMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

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
