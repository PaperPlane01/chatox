package chatox.wallet.service.impl;

import chatox.wallet.external.UserApi;
import chatox.wallet.mapper.UserMapper;
import chatox.wallet.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static chatox.util.test.TestObjects.user;
import static chatox.util.test.TestObjects.userResponse;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@DisplayName("UserServiceImpl tests")
@ExtendWith(MockitoExtension.class)
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
            var user = user();

            when(userRepository.findById(anyString())).thenReturn(Optional.of(user));

            var result = userService.findUserById("123");

            assertFalse(result.isEmpty());
            assertEquals(user, result.get());
        }

        @Test
        @DisplayName("It calls UserApi and saves user in database if user is not present in database")
        void findUser_whenUserNotPresentInDatabase_thenCallApiAndSaveUserToDatabase() {
            var user = user();
            var userResponse = userResponse();

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
