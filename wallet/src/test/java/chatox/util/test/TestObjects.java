package chatox.util.test;

import chatox.platform.security.jwt.JwtPayload;
import chatox.wallet.api.response.BalanceResponse;
import chatox.wallet.api.response.UserResponse;
import chatox.wallet.model.Balance;
import chatox.wallet.model.BalanceChange;
import chatox.wallet.model.BalanceChangeDirection;
import chatox.wallet.model.Reward;
import chatox.wallet.model.User;

import java.math.BigDecimal;

import static chatox.util.test.ResourceLoader.loadResource;

public class TestObjects {

    public static User user() {
        return loadResource("entities/user.json", User.class);
    }

    public static UserResponse userResponse() {
        return loadResource("api/response/user-response.json", UserResponse.class);
    }

    public static Balance balance() {
        return loadResource("entities/balance.json", Balance.class);
    }

    public static BalanceResponse balanceResponse() {
        return loadResource("api/response/balance-response.json", BalanceResponse.class);
    }

    public static JwtPayload jwtPayload() {
        return loadResource("jwt/jwt-payload.json", JwtPayload.class);
    }

    public static Reward reward() {
        return loadResource("entities/reward.json", Reward.class);
    }

    public static BalanceChange balanceChangeIn() {
        return BalanceChange.builder()
                .direction(BalanceChangeDirection.IN)
                .change(BigDecimal.TEN)
                .build();
    }

    public static BalanceChange balanceChangeOut() {
        return BalanceChange.builder()
                .direction(BalanceChangeDirection.OUT)
                .change(BigDecimal.TEN)
                .build();
    }
}
