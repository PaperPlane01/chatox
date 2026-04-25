package chatox.platform.exception.metadata;

import org.springframework.boot.web.error.ErrorAttributeOptions;
import org.springframework.boot.webmvc.error.DefaultErrorAttributes;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.WebRequest;

import java.util.Map;

public class ServletChatoxErrorAttributes extends DefaultErrorAttributes {
    @Override
    public Map<String, Object> getErrorAttributes(WebRequest webRequest, ErrorAttributeOptions options) {
        var errorAttributes = super.getErrorAttributes(webRequest, options);
        var error = getError(webRequest);

        if (error instanceof MetadataEnhancedException metadataEnhancedException) {
            errorAttributes.put("metadata", metadataEnhancedException.getMetadata());
        }

        if (error instanceof MethodArgumentNotValidException methodArgumentNotValidException) {
            errorAttributes.put("constraintViolations", methodArgumentNotValidException.getFieldErrors());
        }

        return errorAttributes;
    }
}
