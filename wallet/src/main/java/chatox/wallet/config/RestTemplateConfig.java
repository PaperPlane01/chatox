package chatox.wallet.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {
    public static final String USER_SERVICE_REST_TEMPLATE = "userServiceRestTemplate";

    @Bean
    @LoadBalanced
    @Qualifier(RestTemplateConfig.USER_SERVICE_REST_TEMPLATE)
    public RestTemplate userRestTemplate() {
        return new RestTemplateBuilder()
                .rootUri("http://user-service/api/v1/users")
                .build();
    }
}
