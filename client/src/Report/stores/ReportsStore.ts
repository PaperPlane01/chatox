import {computedFn} from "mobx-utils";
import {mergeWith} from "lodash";
import {ReportEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {EntitiesPatch} from "../../entities-store";
import {ChatWithCreatorId, Message, Report, ReportType, User} from "../../api/types/response";
import {mergeCustomizer} from "../../utils/object-utils";

export class ReportsStore extends AbstractEntityStore<"reports", ReportEntity, Report> {
    findIdsByType = computedFn((targetType: ReportType) => this
        .findAll()
        .filter(({type}) => type === targetType)
        .map(({id}) => id)
    );

    protected convertToNormalizedForm(denormalizedEntity: Report): ReportEntity {
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

    createPatchForArray(denormalizedEntities: Report[], options: {} | undefined): EntitiesPatch {
        const patch = this.createEmptyEntitiesPatch("reports");
        const patches: EntitiesPatch[] = [];

        denormalizedEntities.forEach(report => {
            patch.entities.reports[report.id] = this.convertToNormalizedForm(report);
            patch.ids.reports.push(report.id);

            patches.push(this.createPatchForReportedObject(report));
        });

        return mergeWith(patch, ...patches, mergeCustomizer);
    }

    private createPatchForReportedObject(report: Report): EntitiesPatch {
        switch (report.type) {
            case ReportType.MESSAGE:
                return this.entities.reportedMessages.createPatch(report.reportedObject as Message);
            case ReportType.CHAT:
                return this.entities.reportedChats.createPatch(report.reportedObject as ChatWithCreatorId);
            case ReportType.USER:
            default:
                return this.entities.reportedUsers.createPatch(report.reportedObject as User);
        }
    }
}