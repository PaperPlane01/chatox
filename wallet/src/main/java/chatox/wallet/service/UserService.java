package chatox.wallet.service;

import chatox.wallet.api.response.UserResponse;
import chatox.wallet.model.User;

import java.util.Optional;

public interface UserService {
    Optional<User> findUserById(String id);
    User requireUserById(String id);
    void saveUser(UserResponse userResponse);
}
