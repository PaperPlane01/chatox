import React, {Fragment, FunctionComponent, PropsWithChildren, ReactElement} from "react";
import {observer} from "mobx-react";
import {useAuthorization} from "../../store";

interface HasAnyRoleProps {
    roles: Array<"ROLE_ADMIN" | "ROLE_USER" | "ROLE_ANONYMOUS_USER" | "ROLE_ACCESS_TOKEN_PRESENT" | "ROLE_NOT_LOGGED_IN">,
    additionalCondition?: boolean,
    alternative?: ReactElement
}

export const HasAnyRole: FunctionComponent<PropsWithChildren<HasAnyRoleProps>> = observer(({
    roles,
    additionalCondition = true,
    alternative,
    children
}) => {
    const {currentUser} = useAuthorization();
    let shouldRender = false;

    if (roles.includes("ROLE_NOT_LOGGED_IN")) {
        if (currentUser === undefined) {
            shouldRender = true
        }
    }

    if (roles.includes("ROLE_ACCESS_TOKEN_PRESENT")) {
        if (localStorage.getItem("accessToken") !== null) {
            shouldRender = true;
        }
    }

    if (!shouldRender) {
        shouldRender = Boolean(currentUser) && currentUser!.roles.some(userRole => roles.includes(userRole));
    }

    shouldRender = shouldRender && additionalCondition;

    return shouldRender
        ? (
            <Fragment>
                {children}
            </Fragment>
        )
        : alternative ? alternative : null;
})
