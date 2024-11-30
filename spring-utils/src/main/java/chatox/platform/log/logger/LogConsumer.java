package chatox.platform.log.logger;

@FunctionalInterface
interface LogConsumer {
    void accept(String message, Object... args);
}
