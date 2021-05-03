import {CalculateUsersIdsToBanFunction} from "../types";

export const reportedMessagesSendersSelector: CalculateUsersIdsToBanFunction = (selectedReports, entitiesStore) => {
    const reports = entitiesStore.reports.findAllById(selectedReports);
    const reportedMessages = entitiesStore.reportedMessages.findAllById(reports.map(report => report.reportedObjectId));

    return reportedMessages.map(message => message.sender);
}

export const reportedUsersSelector: CalculateUsersIdsToBanFunction = (selectedReports, entitiesStore) => {
    const reports = entitiesStore.reports.findAllById(selectedReports);

    return reports.map(report => report.reportedObjectId);
}

export const reportedChatsCreatorsSelector: CalculateUsersIdsToBanFunction = (selectedReports, entitiesStore) => {
    const reports = entitiesStore.reports.findAllById(selectedReports);
    const reportedChats = entitiesStore.reportedChats.findAllById(reports.map(report => report.reportedObjectId));

    return reportedChats.map(reportedChat => reportedChat.createdById);
}
