package chatox.oauth2.domain;

import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import java.util.List;

@Entity
@TypeDef(
        name = "jsonb",
        typeClass = JsonBinaryType.class
)
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

    @Type(type = "jsonb")
    private List<String> userIds;

    private String email;

    @Enumerated(EnumType.STRING)
    private AccountRegistrationType type;
    private String externalAccountId;
}
