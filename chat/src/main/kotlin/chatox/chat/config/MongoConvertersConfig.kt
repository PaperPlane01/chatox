package chatox.chat.config

import chatox.chat.support.converter.ZonedDateTimeReadConverter
import chatox.chat.support.converter.ZonedDateTimeWriteConverter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.mongodb.core.convert.MongoCustomConversions

@Configuration
class MongoConvertersConfig {

    @Bean
    fun customConversions(): MongoCustomConversions {
        return MongoCustomConversions(
                arrayListOf(
                        zonedDateTimeReadConverter(),
                        zonedDateTimeWriteConverter()
                )
        )
    }

    @Bean
    fun zonedDateTimeReadConverter() = ZonedDateTimeReadConverter()

    @Bean
    fun zonedDateTimeWriteConverter() = ZonedDateTimeWriteConverter()
}
