package chatox.platform.validation.annotation;

public enum ComparisonResult {
    LESS_THAN,
    LT,
    LESS_THAN_OR_EQUALS,
    LTE,
    EQUALS,
    EQ,
    GREATER_THAN,
    GT,
    GREATER_THAN_OR_EQUALS,
    GTE;

    @SuppressWarnings({"unchecked", "rawtypes"})
    public boolean satisfices(Comparable first, Comparable second) {
        switch (this) {
            case LESS_THAN, LT -> {
                return first.compareTo(second) < 0;
            }
            case LESS_THAN_OR_EQUALS, LTE -> {
                return first.compareTo(second) <= 0;
            }
            case EQUALS, EQ -> {
                return first.compareTo(second) == 0;
            }
            case GREATER_THAN, GT -> {
                return first.compareTo(second) > 0;
            }
            default -> {
                return first.compareTo(second) >= 0;
            }
        }
    }
}
