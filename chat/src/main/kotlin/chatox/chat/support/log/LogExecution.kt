package chatox.chat.support.log

@Target(allowedTargets = [AnnotationTarget.FUNCTION, AnnotationTarget.CLASS])
@Retention(AnnotationRetention.RUNTIME)
annotation class LogExecution(
        val logReturnValue: Boolean = true,
        val logReturnValueLevel: LogLevel = LogLevel.DEBUG,
        val logParameters: Boolean = true,
        val logParametersLogLevel: LogLevel = LogLevel.DEBUG,
        val logExecutionLogLevel: LogLevel = LogLevel.DEBUG,
        val logError: Boolean = true,
        val logErrorLogLevel: LogLevel = LogLevel.ERROR,
        val methodName: String = "",
        val excludedMethods: Array<String> = [],
        val logOnlyPublicMethods: Boolean = true
)
