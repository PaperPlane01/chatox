package chatox.oauth2.config;

import chatox.oauth2.exception.metadata.MetadataEnhancedException;
import org.springframework.boot.web.servlet.error.DefaultErrorAttributes;
import org.springframework.boot.web.servlet.error.ErrorAttributes;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.WebRequest;

import java.util.Map;

@Configuration
public class ExceptionHandlingConfig {

    @Bean
    public ErrorAttributes errorAttributes() {
        return new DefaultErrorAttributes() {
            @Override
            public Map<String, Object> getErrorAttributes(WebRequest webRequest, boolean includeStackTrace) {
                var errorAttributes = super.getErrorAttributes(webRequest, includeStackTrace);
                var error = getError(webRequest);

                if (error instanceof MetadataEnhancedException) {
                    errorAttributes.put("metadata", ((MetadataEnhancedException) error).getMetadata());
                }

                return errorAttributes;
            }
        };
    }
}
