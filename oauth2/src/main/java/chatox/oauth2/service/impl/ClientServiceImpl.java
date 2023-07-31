package chatox.oauth2.service.impl;

import chatox.oauth2.api.request.CreateClientRequest;
import chatox.oauth2.api.request.UpdateClientRequest;
import chatox.oauth2.api.response.ClientResponse;
import chatox.oauth2.domain.Account;
import chatox.oauth2.domain.AuthorizedGrantType;
import chatox.oauth2.domain.Client;
import chatox.oauth2.domain.Scope;
import chatox.oauth2.exception.AccountNotFoundException;
import chatox.oauth2.exception.ClientNotFoundException;
import chatox.oauth2.exception.InternalUsesScopeException;
import chatox.oauth2.exception.InvalidAuthorizedGrantTypeException;
import chatox.oauth2.exception.InvalidScopeException;
import chatox.oauth2.mapper.ClientMapper;
import chatox.oauth2.respository.AccountRepository;
import chatox.oauth2.respository.AuthorizedGrantTypeRepository;
import chatox.oauth2.respository.ClientRepository;
import chatox.oauth2.respository.ScopeRepository;
import chatox.oauth2.security.AuthenticationFacade;
import chatox.oauth2.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {
    private final ClientRepository clientRepository;
    private final AuthorizedGrantTypeRepository authorizedGrantTypeRepository;
    private final ScopeRepository scopeRepository;
    private final ClientMapper clientMapper;
    private final AccountRepository accountRepository;
    private final AuthenticationFacade authenticationFacade;

    private PasswordEncoder passwordEncoder;

    @Autowired
    @Lazy
    public void setPasswordEncoder(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public ClientResponse createClient(CreateClientRequest createClientRequest) {
        var owner = findAccountById(authenticationFacade.getCurrentUserDetails().getAccountId());
        var authorizedGrantTypes = createClientRequest.getAuthorizedGrantTypes()
                .stream()
                .map(this::findAuthorizedGrantTypeByName)
                .collect(Collectors.toList());
        var scope = createClientRequest.getScope()
                .stream()
                .map(this::findScopeByName)
                .collect(Collectors.toList());


        var client = Client.builder()
                .createdAt(ZonedDateTime.now())
                .name(createClientRequest.getName())
                .accessTokenValidity(createClientRequest.getAccessTokenValidity())
                .refreshTokenValidity(createClientRequest.getRefreshTokenValidity())
                .autoApprove(false)
                .authorizedGrantTypes(authorizedGrantTypes)
                .scope(scope)
                .owner(owner)
                .secretHash(passwordEncoder.encode(createClientRequest.getSecret()))
                .enabled(true)
                .redirectUri(createClientRequest.getRedirectUri())
                .build();

        client = clientRepository.save(client);

        return clientMapper.toClientResponse(client);
    }

    @Override
    public ClientResponse updateClient(String id, UpdateClientRequest updateClientRequest) {
        throw new UnsupportedOperationException("This operation is not yet implemented");
    }

    @Override
    public ClientResponse findClientById(String id) {
        return clientMapper.toClientResponse(findClient(id));
    }

    @Override
    public List<ClientResponse> findClientsOfCurrentUser() {
        return clientRepository.findByOwner(findAccountById(authenticationFacade.getCurrentUserDetails().getAccountId()))
                .stream()
                .map(clientMapper::toClientResponse)
                .collect(Collectors.toList());
    }

    private Client findClient(String clientId) {
        return clientRepository.findById(clientId)
                .orElseThrow(() -> new ClientNotFoundException("Could not find client with id " + clientId));
    }

    private Account findAccountById(String id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Could not find account with id " + id));
    }

    private AuthorizedGrantType findAuthorizedGrantTypeByName(String name) {
        return authorizedGrantTypeRepository.findByName(name)
                .orElseThrow(() -> new InvalidAuthorizedGrantTypeException("Chatox does not support " + name + " grant type"));
    }

    private Scope findScopeByName(String name) {
        var scope = scopeRepository.findByName(name);

        if (scope.isPresent()) {
            var scopeValue = scope.get();

            if (scopeValue.getName().startsWith("internal")) {
                throw new InternalUsesScopeException("Scope " + name + " is used for internal purposes only. External " +
                        "clients are not allowed to use this scope");
            }

            return scopeValue;
        } else {
            throw new InvalidScopeException("Chatox does not support scope " + name);
        }
    }

    @Override
    public void save(RegisteredClient registeredClient) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public RegisteredClient findById(String id) {
        return findClient(id).toRegisteredClient();
    }

    @Override
    public RegisteredClient findByClientId(String clientId) {
        return findClient(clientId).toRegisteredClient();
    }
}
