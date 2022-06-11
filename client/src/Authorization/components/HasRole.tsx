import React, {Fragment, FunctionComponent, PropsWithChildren, ReactElement} from "react";
import {observer} from "mobx-react";
import {convertStringToUserRole} from "../../api/types/response";
import {AuthorizationStore} from "../stores";
import {useAuthorization, useStore} from "../../store";

interface HasRoleProps {
    role: "ROLE_ADMIN" | "ROLE_USER" | "ROLE_ANONYMOUS_USER" | "ROLE_ACCESS_TOKEN_PRESENT" | "ROLE_NOT_LOGGED_IN",
    additionalCondition?: ((authorizationStore: AuthorizationStore) => boolean) | boolean,
    alternative?: ReactElement
}

export const HasRole: FunctionComponent<PropsWithChildren<HasRoleProps>> = observer(({
    role,
    additionalCondition = true,
    children,
    alternative
}) => {
    const {currentUser} = useAuthorization();
    const {authorization} = useStore();
    let shouldRender = false;
    let additionalConditionValue: boolean = typeof additionalCondition === "function" ? additionalCondition(authorization) : Boolean(additionalCondition);

    if (role === "ROLE_NOT_LOGGED_IN") {
       shouldRender = currentUser === undefined && additionalConditionValue;
    } else if (role === "ROLE_ACCESS_TOKEN_PRESENT") {
        shouldRender = Boolean(localStorage.getItem("accessToken"));
    } else {
        shouldRender = currentUser !== undefined
            && currentUser.roles.includes(convertStringToUserRole(role))
            && additionalConditionValue;
    }

    return shouldRender
        ? (
            <Fragment>
                {children}
            </Fragment>
        )
        : alternative ? alternative : null;
});
