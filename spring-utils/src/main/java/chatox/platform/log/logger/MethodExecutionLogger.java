package chatox.platform.log.logger;

import chatox.platform.log.LogExecution;
import chatox.platform.log.LogLevel;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.util.ObjectUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.lang.reflect.Modifier;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.function.Consumer;

@Aspect
@Slf4j
public class MethodExecutionLogger {

    @Around("@within(logExecution)")
    public Object logExecutionOfAnnotatedClass(ProceedingJoinPoint proceedingJoinPoint, LogExecution logExecution) throws Throwable {
        log.debug("Logging method execution");
        var methodSignature = (MethodSignature) proceedingJoinPoint.getSignature();
        var method = methodSignature.getMethod();

        if (!Modifier.isPublic(method.getModifiers()) && logExecution.logOnlyPublicMethods()) {
            return proceedingJoinPoint.proceed();
        }

        if (List.of(logExecution.excludedMethods()).contains(method.getName())) {
            return proceedingJoinPoint.proceed();
        }

        var annotations = method.getAnnotations();

        if (Arrays.stream(annotations).anyMatch(annotation -> annotation instanceof LogExecution)) {
            return proceedingJoinPoint.proceed();
        }

        return logExecution(proceedingJoinPoint, logExecution);
    }

    @Around("@annotation(logExecution)")
    public Object logExecutionOfAnnotatedMethod(ProceedingJoinPoint proceedingJoinPoint, LogExecution logExecution) throws Throwable {
        return logExecution(proceedingJoinPoint, logExecution);
    }

    private Object logExecution(ProceedingJoinPoint proceedingJoinPoint, LogExecution logExecution) throws Throwable {
        var methodSignature = (MethodSignature) proceedingJoinPoint.getSignature();
        var method = methodSignature.getMethod();
        var executionId = UUID.randomUUID().toString().substring(0, 5).toUpperCase();

        String methodName;

        if (!ObjectUtils.isEmpty(logExecution.displayedMethodName())) {
            methodName = logExecution.displayedMethodName();
        } else {
            methodName = method.getDeclaringClass().getSimpleName() + "." + method.getName();
        }

        if (logExecution.logParameters() && shouldLog(logExecution.parametersLogLevel())) {
            var targetLogMethod = getTargetLogMethod(logExecution.parametersLogLevel());
            targetLogMethod.accept(String.format(
                    "%s - Executing method %s with the following parameters: %s",
                    executionId,
                    methodName,
                    Arrays.deepToString(proceedingJoinPoint.getArgs())
            ));
        } else if (shouldLog(logExecution.executionLogLevel())) {
            var targetLogMethod = getTargetLogMethod(logExecution.executionLogLevel());
            targetLogMethod.accept(String.format(
                    "%s - Executing method %s",
                    executionId,
                    methodName
            ));
        }

        try {
            var result = proceedingJoinPoint.proceed();

            if (logExecution.logReturnValue() && shouldLog(logExecution.returnValueLogLevel())) {
                var targetLogMethod = getTargetLogMethod(logExecution.returnValueLogLevel());

                if (method.getReturnType().equals(Void.TYPE)) {
                    logNoResult(executionId, methodName, targetLogMethod);
                    return result;
                }

                if (result instanceof Mono) {
                    return logMono((Mono) result, executionId, methodName, targetLogMethod);
                } else if (result instanceof Flux) {
                    return logFlux((Flux) result, executionId, methodName, targetLogMethod);
                } else {
                    logResult(result, executionId, methodName, targetLogMethod);
                    return result;
                }
            }

            return result;
        } catch (Throwable throwable) {
            if (logExecution.logError() && shouldLog(logExecution.errorLogLevel())) {
                var targetLogMethod = getTargetLogMethod(logExecution.errorLogLevel());
                logError(throwable, executionId, methodName, targetLogMethod);
            }

            throw throwable;
        }
    }

    private boolean shouldLog(LogLevel logLevel) {
        switch (logLevel) {
            case TRACE:
                return log.isTraceEnabled();
            case DEBUG:
                return log.isDebugEnabled();
            case INFO:
            default:
                return log.isInfoEnabled();
            case WARN:
                return log.isWarnEnabled();
            case ERROR:
                return log.isErrorEnabled();
        }
    }

    private Consumer<String> getTargetLogMethod(LogLevel logLevel) {
        switch (logLevel) {
            case TRACE:
                return log::trace;
            case DEBUG:
                return log::debug;
            case INFO:
            default:
                return log::info;
            case WARN:
                return log::warn;
            case ERROR:
                return log::error;
        }
    }

    private <T> Flux<T> logFlux(Flux<T> result, String executionId, String methodName, Consumer<String> targetLogMethod) {
        var fluxCollected = result.collectList();
        return logMono(fluxCollected, executionId, methodName, targetLogMethod)
                .flatMapMany(Flux::fromIterable);
    }

    private <T> Mono<T> logMono(Mono<T> result, String executionId, String methodName, Consumer<String> targetLogMethod) {
        return result
                .flatMap(actualResult -> {
                    logResult(actualResult, executionId, methodName, targetLogMethod);
                    return Mono.just(actualResult);
                })
                .switchIfEmpty(Mono.fromRunnable(() -> logNoResult(executionId, methodName, targetLogMethod)));
    }

    private void logResult(Object result, String executionId, String methodName, Consumer<String> targetLogMethod) {
        targetLogMethod.accept(String.format(
                "%s - Method %s returned the following result %s",
                executionId,
                methodName,
                normalizeText(result.toString())
        ));
    }

    private void logNoResult(String executionId, String methodName, Consumer<String> targetLogMethod) {
        targetLogMethod.accept(String.format(
                "%s - Method %s returned no results",
                executionId,
                methodName
        ));
    }

    private void logError(Throwable throwable, String executionId, String methodName, Consumer<String> targetLogMethod) {
        targetLogMethod.accept(String.format(
                "%s - executing method %s resulted in the following exception: %s",
                executionId,
                methodName,
                throwable.getClass().getSimpleName()
        ));
        throwable.printStackTrace();
    }

    private String normalizeText(String text) {
        return text.replaceAll("\\R+", " ");
    }
}
