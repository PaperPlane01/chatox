package chatox.wallet.external;

import chatox.wallet.api.response.UserResponse;
import chatox.wallet.config.RestTemplateConfig;
import chatox.wallet.exception.InternalServerErrorException;
import chatox.wallet.exception.UserNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

@Component
@Slf4j
public class UserApi {
    private final RestTemplate restTemplate;

    @Autowired
    public UserApi(@Qualifier(RestTemplateConfig.USER_SERVICE_REST_TEMPLATE) RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public UserResponse getUserById(String userId) {
        try {
            return restTemplate.getForObject("/{userId}", UserResponse.class, userId);
        } catch (HttpStatusCodeException httpStatusCodeException) {
            if (httpStatusCodeException.getStatusCode().equals(HttpStatus.NOT_FOUND)) {
                throw new UserNotFoundException("Could not find user with id " + userId);
            }

            log.error("Unknown error occurred when tried to retrieve user by id {}", userId, httpStatusCodeException);
            throw new InternalServerErrorException(
                    "Unknown error occurred when tried to retrieve user by id " + userId,
                    httpStatusCodeException
            );
        }
    }
}
