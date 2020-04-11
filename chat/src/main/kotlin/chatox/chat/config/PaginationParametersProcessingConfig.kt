package chatox.chat.config

import chatox.chat.support.pagination.process.PaginationParametersProcessor
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order

@Configuration
class PaginationParametersProcessingConfig {

    @Bean
    fun paginationParametersProcessor() = PaginationParametersProcessor()
}
