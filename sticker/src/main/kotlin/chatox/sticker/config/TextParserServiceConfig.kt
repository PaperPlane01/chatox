package chatox.sticker.config

import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.cloud.client.loadbalancer.LoadBalanced
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.reactive.function.client.WebClient

@Configuration
class TextParserServiceConfig {

    @Bean
    @Qualifier(TEXT_PARSER_SERVICE_WEB_CLIENT)
    @LoadBalanced
    fun textParserServiceWebClient() = WebClient.builder()

    companion object {
        const val TEXT_PARSER_SERVICE_WEB_CLIENT = "textParserServiceWebClient"
    }
}