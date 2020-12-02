package chatox.oauth2.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
class JwtGlobalBanInfo {
    private String id;
    private ZonedDateTime expiresAt;
    private boolean permanent;
}
