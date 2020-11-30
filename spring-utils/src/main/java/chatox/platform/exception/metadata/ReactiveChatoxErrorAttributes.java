package chatox.platform.exception.metadata;

import org.springframework.boot.web.reactive.error.DefaultErrorAttributes;
import org.springframework.web.reactive.function.server.ServerRequest;

import java.util.Map;

public class ReactiveChatoxErrorAttributes extends DefaultErrorAttributes {
    @Override
    public Map<String, Object> getErrorAttributes(ServerRequest request, boolean includeStackTrace) {
        var errorAttributes = super.getErrorAttributes(request, includeStackTrace);
        var error = getError(request);

        if (error instanceof MetadataEnhancedException) {
            errorAttributes.put("metadata", ((MetadataEnhancedException) error).getMetadata());
        }

        return errorAttributes;
    }
}
