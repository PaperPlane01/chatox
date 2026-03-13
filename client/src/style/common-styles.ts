import {CSSObject} from "tss-react";

type CommonStyles<RuleName extends string> = Record<RuleName, CSSObject>;

const createCommonStyles = <RuleName extends string>(styles: CommonStyles<RuleName>): CommonStyles<RuleName> => {
    return styles;
}

export const commonStyles = createCommonStyles(({
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
}));
