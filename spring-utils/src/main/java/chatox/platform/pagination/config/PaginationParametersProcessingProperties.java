package chatox.platform.pagination.config;

import chatox.platform.pagination.process.PaginationParametersProcessor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "chatox.pagination.processing")
@Getter
@Setter
public class PaginationParametersProcessingProperties {
    private boolean enabled;
}
