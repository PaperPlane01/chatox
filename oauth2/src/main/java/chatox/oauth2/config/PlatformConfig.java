package chatox.oauth2.config;

import chatox.platform.exception.metadata.ServletChatoxErrorAttributes;
import chatox.platform.log.logger.MethodExecutionLogger;
import chatox.platform.time.TimeService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PlatformConfig {
    @Bean
    public TimeService timeService() {
        return new TimeService();
    }

    @Bean
    public ServletChatoxErrorAttributes errorAttributes() {
        return new ServletChatoxErrorAttributes();
    }

    @Bean
    public MethodExecutionLogger methodExecutionLogger() {
        return new MethodExecutionLogger();
    }
}
