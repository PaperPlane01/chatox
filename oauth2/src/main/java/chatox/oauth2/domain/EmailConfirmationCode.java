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

import java.time.ZonedDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmailConfirmationCode {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String email;
    private String confirmationCodeHash;
    private ZonedDateTime createdAt;
    private ZonedDateTime completedAt;
    private ZonedDateTime expiresAt;

    @Enumerated(EnumType.STRING)
    private EmailConfirmationCodeType type;
}
