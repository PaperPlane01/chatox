package chatox.oauth2.controller;

import chatox.oauth2.api.request.CreateClientRequest;
import chatox.oauth2.api.response.ClientResponse;
import chatox.oauth2.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/oauth2/clients")
@RequiredArgsConstructor
public class ClientController {
    private final ClientService clientService;

    @PostMapping
    public ClientResponse createClient(@RequestBody @Valid CreateClientRequest createClientRequest) {
        return clientService.createClient(createClientRequest);
    }
}
