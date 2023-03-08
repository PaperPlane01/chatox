package chatox.platform.pagination.config;

import chatox.platform.pagination.process.PaginationParametersProcessor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PaginationParametersProcessingConfig {

    @Bean
    @ConditionalOnProperty(
            name = "chatox.pagination.parameters.config.enabled",
            havingValue = "true",
            matchIfMissing = true
    )
    public PaginationParametersProcessor paginationParametersProcessor() {
        return new PaginationParametersProcessor();
    }
}
