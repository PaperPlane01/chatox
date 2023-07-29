package chatox.wallet.service;

import chatox.wallet.api.response.UserResponse;
import chatox.wallet.model.User;

public interface UserService {
    User findUserById(String id);
    void saveUser(UserResponse userResponse);
}
