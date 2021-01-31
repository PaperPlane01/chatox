import React, {FunctionComponent, Fragment, ReactNode} from "react";
import {observer} from "mobx-react";
import {Grid, Card, CardContent, Hidden, CircularProgress, Typography, Button, createStyles, makeStyles} from "@material-ui/core";
import {GlobalBanFiltersForm} from "./GlobalBanFiltersForm";
import {GlobalBansTable} from "./GlobalBansTable";
import {GlobalBansList} from "./GlobalBansList";
import {useStore, useLocalization} from "../../store";

const useStyles = makeStyles(() => createStyles({
    centered: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%"
    }
}));

export const GlobalBansContainer: FunctionComponent = observer(() => {
    const {
        globalBansList: {
            globalBanIds,
            fetchGlobalBans,
            paginationState: {
                pending,
                initiallyFetched,
                noMoreItems
            }
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();

    let globalBansCardContent: ReactNode;

    if (globalBanIds.length === 0) {
        if (pending) {
            globalBansCardContent = <CircularProgress className={classes.centered} size={50} color="primary"/>
        } else if (initiallyFetched) {
            globalBansCardContent = (
                <Typography>
                    {l("global.ban.no-bans")}
                </Typography>
            )
        } else {
            globalBansCardContent = null;
        }
    } else {
        globalBansCardContent = (
            <Fragment>
                <Hidden mdDown>
                    <GlobalBansTable/>
                </Hidden>
                <Hidden lgUp>
                    <GlobalBansList/>
                </Hidden>
            </Fragment>
        )
    }

    return (
        <Grid container>
            <Grid item xs={12}>
                <GlobalBanFiltersForm/>
            </Grid>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        {globalBansCardContent}
                        {initiallyFetched && pending && <CircularProgress className={classes.centered} size={50} color="primary"/>}
                    </CardContent>
                    <Button disabled={pending}
                            color="primary"
                            variant="outlined"
                            onClick={fetchGlobalBans}
                    >
                        {l("chats.popular.load-more")}
                    </Button>
                </Card>
            </Grid>
        </Grid>
    );
});
