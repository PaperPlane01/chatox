package chatox.oauth2.respository;

import chatox.oauth2.domain.Account;
import chatox.oauth2.domain.Client;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, String> {
    Client save(Client client);
    Optional<Client> findById(Client client);
    List<Client> findByOwner(Account ownerId);
}
