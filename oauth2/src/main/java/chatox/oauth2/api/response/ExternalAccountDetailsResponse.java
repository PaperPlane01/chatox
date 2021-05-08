package chatox.oauth2.api.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ExternalAccountDetailsResponse {
    private String firstName;
    private String lastName;
    private String avatarUri;
}
