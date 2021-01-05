package chatox.user.config

import chatox.platform.log.aspect.MethodExecutionLogger
import chatox.platform.pagination.process.PaginationParametersProcessor
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class PlatformConfig {
    @Bean
    fun paginationParametersProcessor() = PaginationParametersProcessor()

    @Bean
    fun methodExecutionLogger() = MethodExecutionLogger()
}