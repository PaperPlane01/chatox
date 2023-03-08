package chatox.platform.log.config;

import chatox.platform.log.logger.MethodExecutionLogger;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MethodLoggingExecutionConfig {

    @Bean
    @ConditionalOnProperty(name = "chatox.method.logging.enabled", havingValue = "true")
    public MethodExecutionLogger methodExecutionLogger() {
        return new MethodExecutionLogger();
    }
}
