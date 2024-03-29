package chatox.registration.api.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateAccountRequest {
    private String id;
    private String userId;
    private String username;
    private String password;
    private String clientId;
    private String email;
    private String emailConfirmationCodeId;
    private String emailConfirmationCode;
}
