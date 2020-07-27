package chatox.registration.api.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateUserRequest {
    private String id;
    private String accountId;
    private String firstName;
    private String lastName;
    private String slug;
    private String email;
}
