import {CSSProperties} from "@mui/styles";

interface CommonStyles {
    [key: string]: CSSProperties
}

export const commonStyles: CommonStyles = {
    centered: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%"
    }
}