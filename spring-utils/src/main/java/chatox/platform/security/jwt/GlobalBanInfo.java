package chatox.platform.security.jwt;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
public class GlobalBanInfo implements Serializable {
    private String id;
    private ZonedDateTime expiresAt;
    private boolean permanent;
}
