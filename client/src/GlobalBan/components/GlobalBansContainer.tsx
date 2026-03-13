import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {Box, Button, Card, CardContent, CircularProgress, Grid, Typography} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {GlobalBanFiltersForm} from "./GlobalBanFiltersForm";
import {GlobalBansTable} from "./GlobalBansTable";
import {GlobalBansList} from "./GlobalBansList";
import {useLocalization, useStore} from "../../store";

const useStyles = makeStyles()(() => ({
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
                initiallyFetched
            }
        }
    } = useStore();
    const {l} = useLocalization();
    const { classes } = useStyles();

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
                <Box sx={{
                    display: {
                        md: "none",
                        lg: "block",
                    }
                }}>
                    <GlobalBansTable/>
                </Box>
                <Box sx={{
                    display: {
                        lg: "none",
                        md: "block",
                    }
                }}>
                    <GlobalBansList/>
                </Box>
            </Fragment>
        )
    }

    return (
        <Grid container>
            <Grid size={12}>
                <GlobalBanFiltersForm/>
            </Grid>
            <Grid size={12}>
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
