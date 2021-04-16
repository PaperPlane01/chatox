import React, {FunctionComponent, useState, Fragment} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText, createStyles, makeStyles, Theme, Tooltip} from "@material-ui/core";
import {Report, Message, ChatBubble, Person, ArrowUpward, ArrowDownward} from "@material-ui/icons";
import {useLocalization, useRouter} from "../../store/hooks";
import {Routes} from "../../router";

const {Link} = require("mobx-router");

interface ReportsMenuItemProps {
    onClick: () => void
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    },
    nestedMenu: {
        paddingLeft: theme.spacing(2)
    }
}));

export const ReportsMenuItem: FunctionComponent<ReportsMenuItemProps> = observer(({onClick}) => {
    const {l} = useLocalization();
    const routerStore = useRouter();
    const [expanded, setExpanded] = useState(false);
    const classes = useStyles();

    const handleClick = (): void => {
        onClick();
    };

    return (
        <Fragment>
            <MenuItem onClick={() => setExpanded(!expanded)}>
                <ListItemIcon>
                    <Report/>
                </ListItemIcon>
                <ListItemText>
                    {l("reports")}
                </ListItemText>
                {expanded ? <ArrowUpward color="inherit"/> : <ArrowDownward color="inherit"/>}
            </MenuItem>
            {expanded && (
                <div className={classes.nestedMenu}>
                    <Link store={routerStore}
                          className={classes.undecoratedLink}
                          view={Routes.reportedMessages}
                    >
                        <MenuItem onClick={handleClick}>
                            <ListItemIcon>
                                <Message/>
                            </ListItemIcon>
                            <ListItemText>
                                {l("report.drawer.messages")}
                            </ListItemText>
                        </MenuItem>
                    </Link>
                    <Tooltip title={l("feature.not-available")}>
                        <div>
                            <MenuItem disabled>
                                <ListItemIcon>
                                    <ChatBubble/>
                                </ListItemIcon>
                                <ListItemText>
                                    {l("report.drawer.chats")}
                                </ListItemText>
                            </MenuItem>
                        </div>
                    </Tooltip>
                    <Tooltip title={l("feature.not-available")}>
                        <div>
                            <MenuItem disabled>
                                <ListItemIcon>
                                    <Person/>
                                </ListItemIcon>
                                <ListItemText>
                                    {l("report.drawer.users")}
                                </ListItemText>
                            </MenuItem>
                        </div>
                    </Tooltip>
                </div>
            )}
        </Fragment>
    );
});
