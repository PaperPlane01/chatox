package chatox.oauth2.util;

import java.util.Arrays;
import java.util.Objects;

public class Util {
    public static boolean allNotNull(Object... objects) {
        return Arrays.stream(objects).allMatch(Objects::nonNull);
    }
}
