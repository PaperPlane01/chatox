import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Card, CardContent, Checkbox, FormControlLabel} from "@material-ui/core";
import {useLocalization, useStore} from "../../store";

export const GlobalBanFiltersForm: FunctionComponent = observer(() => {
    const {
        globalBansList: {
            filters,
            setFilterValue
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Card>
            <CardContent>
                <FormControlLabel control={
                    <Checkbox checked={filters.excludeExpired}
                              onChange={event => setFilterValue("excludeExpired", event.target.checked)}
                    />
                }
                                  label={l("global.ban.filters.exclude-expired")}
                />
                <FormControlLabel control={
                    <Checkbox checked={filters.excludeCanceled}
                              onChange={event => setFilterValue("excludeCanceled", event.target.checked)}
                    />
                }
                                  label={l("global.ban.filters.exclude-canceled")}
                />
            </CardContent>
        </Card>
    );
});