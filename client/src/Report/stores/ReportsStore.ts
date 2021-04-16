import {createTransformer} from "mobx-utils";
import {Chat, Message, Report, ReportType, User} from "../../api/types/response";
import {AbstractEntityStore} from "../../entity-store";
import {ReportEntity} from "../types";

export class ReportsStore extends AbstractEntityStore<ReportEntity, Report<any>> {
    public findIdsByType = createTransformer((targetType: ReportType) => this
        .findAll()
        .filter(({type}) => type === targetType)
        .map(({id}) => id)
    )

    protected convertToNormalizedForm(denormalizedEntity: Report<{id: string}>): ReportEntity {
        return {
            id: denormalizedEntity.id,
            type: denormalizedEntity.type,
            reportedObjectId: denormalizedEntity.reportedObject.id,
            createdAt: new Date(denormalizedEntity.createdAt),
            description: denormalizedEntity.description,
            reason: denormalizedEntity.reason,
            status: denormalizedEntity.status,
            submittedById: denormalizedEntity.submittedById,
            submittedByIdAddress: denormalizedEntity.submittedByIpAddress,
            takenActions: denormalizedEntity.takenActions
        };
    }
}
