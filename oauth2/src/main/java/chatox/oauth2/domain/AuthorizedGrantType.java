package chatox.oauth2.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.oauth2.core.AuthorizationGrantType;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthorizedGrantType {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Enumerated(EnumType.STRING)
    private GrantType name;

    public AuthorizationGrantType toAuthorizationGrantType() {
        return name.toAuthorizationGrantType();
    }
}
