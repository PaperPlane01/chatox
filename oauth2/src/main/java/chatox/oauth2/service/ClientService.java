package chatox.oauth2.service;

import chatox.oauth2.api.request.CreateClientRequest;
import chatox.oauth2.api.request.UpdateClientRequest;
import chatox.oauth2.api.response.ClientResponse;
import org.springframework.security.oauth2.provider.ClientDetailsService;

import java.util.List;

public interface ClientService extends ClientDetailsService {
    ClientResponse createClient(CreateClientRequest createClientRequest);
    ClientResponse updateClient(String id, UpdateClientRequest updateClientRequest);
    ClientResponse findClientById(String id);
    List<ClientResponse> findClientsOfCurrentUser();
}
