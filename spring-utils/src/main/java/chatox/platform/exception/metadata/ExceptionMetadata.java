package chatox.platform.exception.metadata;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ExceptionMetadata {
    private String errorCode;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private Map<String, String> additional;
}
