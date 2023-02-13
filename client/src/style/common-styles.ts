import {CSSProperties} from "@mui/styles";

type CommonStyles = Record<string, CSSProperties>;

export const commonStyles: CommonStyles = {
    centered: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%"
    },
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    }
}