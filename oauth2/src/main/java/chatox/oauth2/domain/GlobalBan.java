package chatox.oauth2.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
public class GlobalBan {
    @Id
    private String id;

    @ManyToOne
    @JoinColumn
    private Account bannedAccount;

    private boolean permanent;
    private ZonedDateTime expiresAt;
    private boolean canceled;
    private ZonedDateTime canceledAt;
    private ZonedDateTime updatedAt;

    private String bannedUserId;
}
