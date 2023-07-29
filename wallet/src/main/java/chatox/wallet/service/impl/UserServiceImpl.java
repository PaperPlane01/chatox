package chatox.wallet.service.impl;

import chatox.wallet.api.response.UserResponse;
import chatox.wallet.external.UserApi;
import chatox.wallet.mapper.UserMapper;
import chatox.wallet.model.User;
import chatox.wallet.repository.UserRepository;
import chatox.wallet.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserApi userApi;
    private final UserMapper userMapper;

    @Override
    public User findUserById(String id) {
        return userRepository
                .findById(id)
                .orElseGet(() -> {
                    var userResponse = userApi.getUserById(id);
                    var user = userMapper.toUser(userResponse);
                    userRepository.save(user);

                    return user;
                });
    }

    @Override
    public void saveUser(UserResponse userResponse) {
        userRepository.save(userMapper.toUser(userResponse));
    }
}
