package chatox.platform;

import chatox.platform.time.TimeService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan(basePackages = "chatox.platform")
public class ChatoxConfig {

    @Bean
    public TimeService timeService() {
        return new TimeService();
    }
}
