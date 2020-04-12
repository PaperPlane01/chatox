package chatox.registration.api.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateUserResponse {
    private String id;
    private String firstName;
    private String lastName;
    private String slug;
    private String avatarUri;
    private ZonedDateTime createdAt;
}
