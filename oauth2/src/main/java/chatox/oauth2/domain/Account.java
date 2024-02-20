package chatox.oauth2.domain;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Account {
    @Id
    private String id;
    private String username;
    private String passwordHash;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "accountToRole",
            joinColumns = {
                    @JoinColumn(name = "accountId")
            },
            inverseJoinColumns = {
                    @JoinColumn(name = "roleId")
            }
    )
    private List<UserRole> roles;

    private boolean enabled;
    private boolean locked;

    @Type(JsonBinaryType.class)
    private List<String> userIds;

    private String email;

    @Enumerated(EnumType.STRING)
    private AccountRegistrationType type;
    private String externalAccountId;
}
