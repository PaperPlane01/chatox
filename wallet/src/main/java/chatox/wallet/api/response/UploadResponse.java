package chatox.wallet.api.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UploadResponse<T> {
    private String id;
    private String name;
    private String extension;
    private String mimeType;
    private T meta;
    private UploadType type;
    private String uri;
    private String originalName;
}
