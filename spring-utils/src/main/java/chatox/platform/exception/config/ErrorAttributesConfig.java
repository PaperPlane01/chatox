package chatox.platform.exception.config;

import chatox.platform.exception.metadata.ReactiveChatoxErrorAttributes;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ErrorAttributesConfig {

    @Bean
    @ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.REACTIVE)
    public ReactiveChatoxErrorAttributes reactiveChatoxErrorAttributes() {
        return new ReactiveChatoxErrorAttributes();
    }
}
