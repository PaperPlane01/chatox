package chatox.sticker.config

import chatox.platform.pagination.process.PaginationParametersProcessor
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class PlatformConfig {
    @Bean
    fun paginationParametersProcessor() = PaginationParametersProcessor()
}
