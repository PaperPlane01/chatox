package chatox.oauth2.messaging.rabbitmq.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GlobalBanCreatedOrUpdated {
    private String id;
    private ZonedDateTime expiresAt;
    private GlobalBanUser bannedUser;
    private boolean canceled;
    private boolean permanent;
    private String comment;
    private String reason;
    private GlobalBanUser createdBy;
    private ZonedDateTime canceledAt;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
