import React, {Fragment, FunctionComponent, useState} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem, Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {ArrowDownward, ArrowUpward, ChatBubble, Message, Person, Report} from "@mui/icons-material";
import {Link} from "mobx-router";
import {useLocalization, useRouter} from "../../store";
import {Routes} from "../../router";

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
                    <Link router={routerStore}
                          className={classes.undecoratedLink}
                          route={Routes.reportedMessages}
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
                    <Link router={routerStore}
                          className={classes.undecoratedLink}
                          route={Routes.reportedMessages}
                    >
                        <MenuItem onClick={handleClick}>
                            <ListItemIcon>
                                <Person/>
                            </ListItemIcon>
                            <ListItemText>
                                {l("report.drawer.users")}
                            </ListItemText>
                        </MenuItem>
                    </Link>
                    <Link router={routerStore}
                          className={classes.undecoratedLink}
                          route={Routes.reportedMessages}
                    >
                        <MenuItem onClick={handleClick}>
                            <ListItemIcon>
                                <ChatBubble/>
                            </ListItemIcon>
                            <ListItemText>
                                {l("report.drawer.chats")}
                            </ListItemText>
                        </MenuItem>
                    </Link>
                </div>
            )}
        </Fragment>
    );
});
