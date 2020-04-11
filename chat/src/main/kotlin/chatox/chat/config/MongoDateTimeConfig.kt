package chatox.chat.config

import chatox.chat.support.converter.ZonedDateTimeReadConverter
import chatox.chat.support.converter.ZonedDateTimeWriteConverter
import chatox.chat.support.datetime.CustomDateTimeProvider
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.mongodb.core.convert.MongoCustomConversions

@Configuration
class MongoDateTimeConfig {

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

    @Bean
    fun dateTimeProvider() = CustomDateTimeProvider()
}
