package chatox.registration.client.impl;

import chatox.registration.api.request.CreateUserRequest;
import chatox.registration.api.response.CreateUserResponse;
import chatox.registration.client.UserServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class UserServiceClientImpl implements UserServiceClient {
    private final WebClient webClient;

    @Override
    public Mono<CreateUserResponse> createUser(CreateUserRequest createUserRequest) {
        return webClient
                .post()
                .uri("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(Mono.just(createUserRequest), CreateUserRequest.class)
                .retrieve()
                .bodyToMono(CreateUserResponse.class);
    }
}
