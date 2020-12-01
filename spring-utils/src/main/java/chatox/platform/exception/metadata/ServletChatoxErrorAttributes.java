package chatox.platform.exception.metadata;

import org.springframework.boot.web.error.ErrorAttributeOptions;
import org.springframework.boot.web.servlet.error.DefaultErrorAttributes;
import org.springframework.web.context.request.WebRequest;

import java.util.Map;

public class ServletChatoxErrorAttributes extends DefaultErrorAttributes {
    @Override
    public Map<String, Object> getErrorAttributes(WebRequest webRequest, boolean includeStackTrace) {
        var errorAttributes = super.getErrorAttributes(webRequest, includeStackTrace);
        var error = getError(webRequest);

        if (error instanceof MetadataEnhancedException) {
            errorAttributes.put("metadata", ((MetadataEnhancedException) error).getMetadata());
        }

        return errorAttributes;
    }
}
