package chatox.wallet.event;

import chatox.wallet.model.UserInteractionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserInteractionCreated {
    private String id;
    private UserInteractionType type;
    private BigDecimal cost;
    private String userId;
    private String targetUserId;
    private ZonedDateTime createdAt;
}
