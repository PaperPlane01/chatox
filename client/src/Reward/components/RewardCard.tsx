import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Card, CardActions, CardContent, CardHeader, Collapse, Grid, IconButton} from "@mui/material";
import {ExpandMore} from "@mui/icons-material";
import {format} from "date-fns";
import {EditRewardButton} from "./EditRewardButton";
import {RewardProperty} from "./RewardProperty";
import {UserLink} from "../../UserLink";
import {useEntities, useLocalization, useStore} from "../../store";
import {isStringEmpty} from "../../utils/string-utils";
import {Labels} from "../../localization";

interface RewardCardProps {
    rewardId: string
}

export const RewardCard: FunctionComponent<RewardCardProps> = observer(({
    rewardId
}) => {
    const {
        rewards: {
            findById: findReward
        },
        users: {
            findById: findUser
        }
    } = useEntities();
    const {l} = useLocalization();
    const {
        rewardDetails: {
            isRewardDetailsExpanded,
            expandRewardDetails,
            collapseRewardDetails
        }
    } = useStore();

    const reward = findReward(rewardId);
    const rewardDetailsExpanded = isRewardDetailsExpanded(rewardId);
    const rewardedUser = reward.rewardedUserId
        ? findUser(reward.rewardedUserId)
        : undefined;
    const createdBy = findUser(reward.createdById);
    const updatedBy = reward.updatedById
        ? findUser(reward.updatedById)
        : undefined;
    const rewardTitle = isStringEmpty(reward.name)
        ? l("reward.with-no-name")
        : l("reward.with-name", {rewardName: reward.name});

    const handleExpandClick = (): void => {
        if (rewardDetailsExpanded) {
            collapseRewardDetails(rewardId);
        } else {
            expandRewardDetails(rewardId);
        }
    };

    return (
        <Card>
            <CardHeader title={rewardTitle}
                        action={<EditRewardButton rewardId={rewardId}/>}
            />
            <CardContent>
                <Grid container>
                    <RewardProperty name={l("reward.min-value")}
                                    value={reward.minRewardValue}
                    />
                    <RewardProperty name={l("reward.max-value")}
                                    value={reward.maxRewardValue}
                    />
                    {reward.recurringPeriodUnit && reward.recurringPeriodValue && (
                        <Fragment>
                            <RewardProperty name={l("reward.recurring-period.unit")}
                                            value={l(`reward.recurring-period.unit.${reward.recurringPeriodUnit}` as keyof Labels)}
                            />
                            <RewardProperty name={l("reward.recurring-period.value")}
                                            value={reward.recurringPeriodValue}
                            />
                        </Fragment>
                    )}
                    {rewardedUser && (
                        <RewardProperty name={l("reward.user")}
                                        value={<UserLink user={rewardedUser} displayAvatar={false}/>}
                        />
                    )}
                </Grid>
            </CardContent>
            <CardActions>
                <IconButton onClick={handleExpandClick}
                            sx={theme => ({
                                transform: rewardDetailsExpanded ? "rotate(180deg)" : "rotate(0deg)",
                                marginLeft: "auto",
                                transition: theme.transitions.create("transform", {
                                    duration: theme.transitions.duration.shortest
                                })
                            })}
                >
                    <ExpandMore/>
                </IconButton>
            </CardActions>
            <Collapse in={rewardDetailsExpanded}
                      timeout="auto"
                      unmountOnExit
            >
                <CardContent>
                    {reward.periodStart && reward.periodEnd && (
                        <Fragment>
                            <RewardProperty name={l("reward.period.start")}
                                            value={format(reward.periodStart, "dd-MM-yyyy hh:mm:ss")}
                            />
                            <RewardProperty name={l("reward.period.end")}
                                            value={format(reward.periodEnd, "dd-MM-yyyy hh:mm:ss")}
                            />
                        </Fragment>
                    )}
                    <RewardProperty name={l("reward.created-at")}
                                    value={format(reward.createdAt, "dd-MM-yyyy hh:mm:ss")}
                    />
                    <RewardProperty name={l("reward.created-by")}
                                    value={<UserLink user={createdBy} displayAvatar={false}/>}
                    />
                    {updatedBy && reward.updatedAt && (
                        <Fragment>
                            <RewardProperty name={l("reward.updated-at")}
                                            value={format(reward.updatedAt, "dd-MM-yyyy hh:mm:ss")}
                            />
                            <RewardProperty name={l("reward.updated-by")}
                                            value={<UserLink user={updatedBy} displayAvatar={false}/>}
                            />
                        </Fragment>
                    )}
                </CardContent>
            </Collapse>
        </Card>
    );
});