package chatox.wallet.model;

import chatox.wallet.api.response.UploadType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Upload<T extends Serializable> implements Serializable {
    private String id;
    private String name;
    private String extension;
    private String mimeType;
    private T meta;
    private UploadType type;
    private String uri;
    private String originalName;
}
