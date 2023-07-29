package chatox.wallet.exception;

import chatox.wallet.model.Currency;

public class BalanceNotFoundException extends RuntimeException {
    public BalanceNotFoundException() {
    }

    public BalanceNotFoundException(String userId, Currency currency) {
        this(String.format("Could not find balance for user %s and currency %s", userId, currency));
    }

    public BalanceNotFoundException(String message) {
        super(message);
    }

    public BalanceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
