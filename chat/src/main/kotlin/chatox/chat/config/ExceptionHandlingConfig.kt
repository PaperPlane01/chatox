package chatox.chat.config

import chatox.chat.support.exception.CustomErrorAttributes
import org.springframework.boot.web.reactive.error.ErrorAttributes
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class ExceptionHandlingConfig  {
    @Bean
    fun errorAttributes(): ErrorAttributes = CustomErrorAttributes()
}
