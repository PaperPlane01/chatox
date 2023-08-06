package chatox.wallet.service.impl;

import chatox.wallet.api.response.UserResponse;
import chatox.wallet.external.UserApi;
import chatox.wallet.mapper.UserMapper;
import chatox.wallet.model.User;
import chatox.wallet.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import java.util.Optional;

import static chatox.util.test.ResourceLoader.loadResource;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@DisplayName("UserServiceImpl tests")
class UserServiceTests {
    @Mock
    UserRepository userRepository;

    @Mock
    UserApi userApi;

    @Mock
    UserMapper userMapper;

    @InjectMocks
    UserServiceImpl userService;

    @Nested
    @DisplayName("findUser() tests")
    class FindUserTests {

        @Test
        @DisplayName("It returns user from database")
        void findUser_returnsUserFromDatabase() {
            var user = loadResource("user.json", User.class);
            var userResponse = loadResource("user-response.json", UserResponse.class);

            when(userRepository.findById(anyString())).thenReturn(Optional.of(user));
            when(userMapper.toUserResponse(user)).thenReturn(userResponse);

            var result = userService.findUserById("123");

            assertFalse(result.isEmpty());
            assertEquals(user, result.get());
        }

        @Test
        @DisplayName("It calls UserApi and saves user in database if user is not present in database")
        void findUser_whenUserNotPresentInDatabase_thenCallApiAndSaveUserToDatabase() {
            var user = loadResource("user.json", User.class);
            var userResponse = loadResource("user-response.json", UserResponse.class);

            when(userRepository.findById(anyString())).thenReturn(Optional.empty());
            when(userApi.getUserById(anyString(), eq(true))).thenReturn(userResponse);
            when(userMapper.toUser(userResponse)).thenReturn(user);
            when(userRepository.save(user)).thenReturn(user);

            var result = userService.findUserById("123");

            assertFalse(result.isEmpty());
            assertEquals(user, result.get());

            verify(userRepository, times(1)).save(eq(user));
        }
    }
}
