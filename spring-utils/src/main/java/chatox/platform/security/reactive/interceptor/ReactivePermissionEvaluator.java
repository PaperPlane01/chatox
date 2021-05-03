package chatox.platform.security.reactive.interceptor;

import chatox.platform.security.reactive.annotation.ReactivePermissionCheck;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.CodeSignature;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.expression.BeanFactoryResolver;
import org.springframework.core.annotation.Order;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.security.access.AccessDeniedException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Aspect
@Order(2)
@Slf4j
public class ReactivePermissionEvaluator implements ApplicationContextAware {
    private ApplicationContext applicationContext;

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }

    @Around("@annotation(reactivePermissionCheck)")
    public Object checkPermissions(ProceedingJoinPoint proceedingJoinPoint, ReactivePermissionCheck reactivePermissionCheck) throws Throwable {
        log.debug("Evaluating reactive permission expression");

        var signature = (CodeSignature) proceedingJoinPoint.getSignature();
        var returnType = ((MethodSignature) signature).getReturnType();

        if (!Mono.class.isAssignableFrom(returnType) && !Flux.class.isAssignableFrom(returnType)) {
            log.error("Method which is annotated with ReactivePermissionCheck must return either Mono or Flux");
            throw new IllegalArgumentException("Method which is annotated with ReactivePermissionCheck must return either Mono or Flux");
        }

        String expression = reactivePermissionCheck.value();
        log.debug("Expression value is {}", expression);

        var expressionParser = new SpelExpressionParser();
        var evaluationContext = new StandardEvaluationContext(expressionParser);
        var beanResolver = new BeanFactoryResolver(applicationContext);
        evaluationContext.setBeanResolver(beanResolver);

        for (int index = 0; index < proceedingJoinPoint.getArgs().length; index++) {
            evaluationContext.setVariable(signature.getParameterNames()[index], proceedingJoinPoint.getArgs()[index]);
        }

        var evaluationResult = (Mono<Boolean>) expressionParser.parseExpression(expression).getValue(evaluationContext);

        if (Mono.class.isAssignableFrom(returnType)) {
            return evaluationResult.flatMap(result -> {
                log.debug("Permission evaluation result is {}", result);
                if (result) {
                    try {
                        return (Mono) proceedingJoinPoint.proceed();
                    } catch (Throwable throwable) {
                        return Mono.error(throwable);
                    }
                } else {
                    return Mono.error(new AccessDeniedException("Access denied"));
                }
            });
        } else {
            return evaluationResult.flatMapMany(result -> {
                log.debug("Permission evaluation result is {}", result);
                if (result) {
                    try {
                        return (Flux) proceedingJoinPoint.proceed();
                    } catch (Throwable throwable) {
                        return Mono.error(throwable);
                    }
                } else {
                    return Mono.error(new AccessDeniedException("Access denied"));
                }
            });
        }
    }
}
