package chatox.chat.config

import chatox.platform.exception.metadata.ReactiveChatoxErrorAttributes
import chatox.platform.log.logger.MethodExecutionLogger
import chatox.platform.pagination.process.PaginationParametersProcessor
import chatox.platform.time.TimeService
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class PlatformConfig {

    @Bean
    fun paginationParametersProcessor() = PaginationParametersProcessor()

    @Bean
    fun methodExecutionLogger() = MethodExecutionLogger()

    @Bean
    fun errorAttributes() = ReactiveChatoxErrorAttributes()

    @Bean
    fun timeService() = TimeService()
}
