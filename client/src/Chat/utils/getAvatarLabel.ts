export const getAvatarLabel = (chatName: string): string => {
    if (chatName.includes(" ")) {
        const parts = chatName.split(" ");
        return parts.slice(0, 2)
            .map(part => part[0])
            .reduce((left, right) => `${left}${right}`)
            .toUpperCase();
    } else {
        return chatName[0].toUpperCase();
    }
};
