package chatox.wallet.config;


import chatox.platform.exception.metadata.ServletChatoxErrorAttributes;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CustomErrorAttributesConfig {

    @Bean
    public ServletChatoxErrorAttributes servletChatoxErrorAttributes() {
        return new ServletChatoxErrorAttributes();
    }
}
