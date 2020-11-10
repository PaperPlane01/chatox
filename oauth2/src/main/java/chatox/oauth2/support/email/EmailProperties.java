package chatox.oauth2.support.email;

import chatox.oauth2.domain.Language;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.temporal.ChronoUnit;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
class EmailProperties {
    private String templateBaseName;
    private Map<Language, String> subjectsMap;
    private Long expirationAmount;
    private ChronoUnit expirationChronoUnit;
    private EmailSourceStrategy emailSourceStrategy;
    private boolean requiresCheckingAccountExistence;
}
