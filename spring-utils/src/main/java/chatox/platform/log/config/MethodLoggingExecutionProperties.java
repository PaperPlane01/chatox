package chatox.platform.log.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties("chatox.method.logging")
@Getter
@Setter
public class MethodLoggingExecutionProperties {
    private boolean enabled = false;
}
