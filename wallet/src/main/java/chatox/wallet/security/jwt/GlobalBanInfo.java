package chatox.wallet.security.jwt;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
public class GlobalBanInfo {
    private String id;
    private ZonedDateTime expiresAt;
    private boolean permanent;
}
