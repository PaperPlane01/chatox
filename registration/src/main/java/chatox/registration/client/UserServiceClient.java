package chatox.registration.client;

import chatox.registration.api.request.CreateUserRequest;
import chatox.registration.api.response.CreateUserResponse;
import reactor.core.publisher.Mono;

public interface UserServiceClient {
    Mono<CreateUserResponse> createUser(CreateUserRequest createUserRequest);
}
