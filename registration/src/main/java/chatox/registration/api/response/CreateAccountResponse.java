package chatox.registration.api.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateAccountResponse {
    private Account account;
    private String accessToken;
    private String refreshToken;
}
