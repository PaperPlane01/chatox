package chatox.sticker.config

import chatox.sticker.support.converter.ZonedDateTimeReadConverter
import chatox.sticker.support.converter.ZonedDateTimeWriteConverter
import chatox.sticker.support.datetime.CustomDateTimeProvider
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

    @Bean
    fun dateTimeProvider() = CustomDateTimeProvider()
}
