interface WithFirstNameAndLastName {
    firstName: string,
    lastName?: string
}

export const getUserAvatarLabel = (user: WithFirstNameAndLastName): string => {
    return `${user.firstName[0]} ${user.lastName ? user.lastName[0] : ""}`;
};
