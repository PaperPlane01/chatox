package chatox.wallet.event.listener;

import chatox.wallet.api.response.UserResponse;
import chatox.wallet.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserEventsListener {
    private final UserService userService;

    @RabbitListener(queues = "wallet_service_user_created")
    public void onUserCreated(UserResponse userResponse) {
        userService.saveUser(userResponse);
    }

    @RabbitListener(queues = "wallet_service_user_updated")
    public void onUserUpdated(UserResponse userResponse) {
        userService.saveUser(userResponse);
    }
}
