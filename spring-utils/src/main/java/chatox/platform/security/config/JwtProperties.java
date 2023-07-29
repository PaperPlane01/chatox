package chatox.platform.security.config;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "chatox.jwt")
@Getter
@Setter
@NoArgsConstructor
public class JwtProperties {
    private String publicKey;
}
