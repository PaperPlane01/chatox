package chatox.chat.support.log.aspect

import chatox.chat.support.log.LogExecution
import chatox.chat.support.log.LogLevel
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.aspectj.lang.reflect.MethodSignature
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.lang.reflect.Modifier
import java.util.Arrays
import java.util.UUID

@Component
@Aspect
class MethodExecutionLoggingAspect {
    private val log = LoggerFactory.getLogger(this.javaClass)

    @Around("@within(logExecution)")
    fun logExecutionOfAnnotatedClass(proceedingJoinPoint: ProceedingJoinPoint, logExecution: LogExecution): Any {
        if (!shouldLog(logExecution.logExecutionLogLevel)) {
            return proceedingJoinPoint.proceed()
        }

        val methodSignature = proceedingJoinPoint.signature as MethodSignature
        val method = methodSignature.method

        if (!Modifier.isPublic(method.modifiers) && logExecution.logOnlyPublicMethods) {
            return proceedingJoinPoint.proceed()
        }

        if (listOf(*logExecution.excludedMethods).contains(method.name)) {
            return proceedingJoinPoint.proceed()
        }

        val methodAnnotations = method.annotations

        if (listOf(*methodAnnotations).find { annotation -> annotation is LogExecution } != null) {
            return proceedingJoinPoint.proceed()
        }

        return logExecution(proceedingJoinPoint, logExecution)
    }

    @Around("@annotation(logExecution)")
    fun logExecutionOfAnnotatedMethod(proceedingJoinPoint: ProceedingJoinPoint, logExecution: LogExecution): Any {
        return logExecution(proceedingJoinPoint, logExecution)
    }

    private fun logExecution(proceedingJoinPoint: ProceedingJoinPoint, logExecution: LogExecution): Any {
        val methodSignature = proceedingJoinPoint.signature as MethodSignature
        val method = methodSignature.method
        val executionId = UUID.randomUUID().toString().substring(0, 5).toUpperCase()
        val methodName: String = if (logExecution.methodName.trim().isNotEmpty()) {
            logExecution.methodName
        } else {
            "${method.declaringClass.name}.${method.name}"
        }

        if (logExecution.logParameters && shouldLog(logExecution.logParametersLogLevel)) {
            val log = getTargetLogMethod(logExecution.logParametersLogLevel)
            log("$executionId - Executing method $methodName with the following parameters: ${Arrays.deepToString(proceedingJoinPoint.args)}")
        } else if (shouldLog(logExecution.logExecutionLogLevel)) {
            val log = getTargetLogMethod(logExecution.logExecutionLogLevel)
            log("$executionId - Executing $methodName")
        }

        try {
            val result = proceedingJoinPoint.proceed()

            if (logExecution.logReturnValue && shouldLog(logExecution.logReturnValueLevel)) {
                val log = getTargetLogMethod(logExecution.logReturnValueLevel)

                when (result) {
                    is Mono<*> -> {
                        return mono {
                            val loggableResult = result.awaitFirst()
                            log("$executionId - Method $methodName returned the following result: $loggableResult")
                            loggableResult
                        }
                    }
                    is Flux<*> -> {
                        return mono {
                            val loggableResult = result.collectList().awaitFirst()
                            log("$executionId - Method $methodName returned the following result: $loggableResult")
                            Flux.fromIterable(loggableResult)
                        }
                                .flatMapMany { it }
                    }
                    else -> {
                        log("$executionId - Method $methodName returned the following result: $result")
                        return result
                    }
                }
            } else {
                return result
            }
        } catch (throwable: Throwable) {
            if (logExecution.logError && shouldLog(logExecution.logErrorLogLevel)) {
                val log = getTargetLogMethod(logExecution.logErrorLogLevel)
                log("$executionId - Executing method $methodName resulted in the following exception: ${throwable.javaClass.simpleName}")
                throwable.printStackTrace()
            }

            throw throwable
        }
    }

    private fun shouldLog(logLevel: LogLevel): Boolean {
        return when (logLevel) {
            LogLevel.TRACE -> log.isTraceEnabled
            LogLevel.DEBUG -> log.isDebugEnabled
            LogLevel.INFO -> log.isInfoEnabled
            LogLevel.WARN -> log.isWarnEnabled
            LogLevel.ERROR -> log.isErrorEnabled
        }
    }

    private fun getTargetLogMethod(logLevel: LogLevel): ((String) -> Unit) {
        return when (logLevel) {
            LogLevel.TRACE -> log::trace
            LogLevel.DEBUG -> log::debug
            LogLevel.INFO -> log::info
            LogLevel.WARN -> log::warn
            LogLevel.ERROR -> log::error
        }
    }
}
