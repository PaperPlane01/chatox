package chatox.chat.config

import chatox.chat.support.pagination.process.PaginationParametersProcessor
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class PaginationParametersProcessingConfig {

    @Bean
    fun paginationParametersProcessor() = PaginationParametersProcessor()
}
