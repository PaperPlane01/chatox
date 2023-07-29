package chatox.wallet.api.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponse {
    private String id;
    private String slug;
    private String firstName;
    private String lastName;
    private ZonedDateTime createdAt;
    private ZonedDateTime dateOfBirth;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String email;

    private UploadResponse<ImageMetadata> avatar;
    private String externalAvatarUri;
}
