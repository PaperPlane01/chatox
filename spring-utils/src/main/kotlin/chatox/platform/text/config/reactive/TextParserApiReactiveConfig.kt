package chatox.platform.text.config.reactive

import chatox.platform.text.api.reactive.TextParserApi
import chatox.platform.text.config.properties.TextParserConfigProperties
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication
import org.springframework.cloud.client.loadbalancer.LoadBalanced
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Conditional
import org.springframework.context.annotation.Configuration
import org.springframework.web.reactive.function.client.WebClient

@Configuration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.REACTIVE)
@ConditionalOnProperty(value = ["chatox.text.parser.service.enabled"], havingValue = "true")
class TextParserApiReactiveConfig {
    companion object {
        const val TEXT_PARSER_WEB_CLIENT = "textParserWebClient"
    }

    @Bean
    @LoadBalanced
    @Qualifier(TEXT_PARSER_WEB_CLIENT)
    fun textParserWebClient(): WebClient.Builder {
        return WebClient.builder()
    }

    @Bean
    fun textParserApi(@Qualifier(TEXT_PARSER_WEB_CLIENT) webClient: WebClient.Builder,
                      textParserConfigProperties: TextParserConfigProperties
    ): TextParserApi {
        return TextParserApi(webClient, textParserConfigProperties.name)
    }
}
