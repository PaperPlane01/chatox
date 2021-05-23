import {CurrentUser} from "../../api/types/response";

export const canReportUser = (userId: string, currentUser?: CurrentUser): boolean => Boolean(!currentUser || currentUser.id !== userId);
