package chatox.platform.security.confirmation;

import java.util.Optional;
import java.util.stream.Stream;

public enum ConfirmationTokenAction {
    TRANSFER_CHAT_OWNERSHIP;

    public static Optional<ConfirmationTokenAction> fromString(String value) {
        return Stream.of(values())
                .filter(currentValue -> currentValue.name().equals(value))
                .findFirst();
    }
}
