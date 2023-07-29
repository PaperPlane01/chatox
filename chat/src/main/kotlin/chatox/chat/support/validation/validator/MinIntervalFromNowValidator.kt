package chatox.chat.support.validation.validator

import chatox.chat.support.validation.annotation.MinIntervalFromNow
import org.slf4j.LoggerFactory
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.Date
import jakarta.validation.ConstraintValidator
import jakarta.validation.ConstraintValidatorContext

class MinIntervalFromNowValidator : ConstraintValidator<MinIntervalFromNow, Any> {
    private lateinit var constraintAnnotation: MinIntervalFromNow
    private val log = LoggerFactory.getLogger(this.javaClass)

    override fun initialize(constraintAnnotation: MinIntervalFromNow?) {
        this.constraintAnnotation = constraintAnnotation!!
    }

    override fun isValid(value: Any?, context: ConstraintValidatorContext?): Boolean {
        val now = ZonedDateTime.now()

        if (value == null) {
            return constraintAnnotation.allowNull
        }

        log.debug("Validating date: min interval")

        when (value) {
            is ZonedDateTime -> {
                val difference = constraintAnnotation.chronoUnit.between(now, value)
                log.debug("Difference between now and validated date is $difference ${constraintAnnotation.chronoUnit.name}")
                log.debug("Result will be ${difference >= constraintAnnotation.value}")

                return difference >= constraintAnnotation.value
            }
            is Date -> {
                val zonedDateTime = ZonedDateTime.ofInstant(value.toInstant(), ZoneId.of("UTC"))
                val difference = constraintAnnotation.chronoUnit.between(zonedDateTime, now)

                return difference >= constraintAnnotation.value
            }
            is Long -> {
                val date = Date(value)
                val zonedDateTime = ZonedDateTime.ofInstant(date.toInstant(), ZoneId.of("UTC"))
                val difference = constraintAnnotation.chronoUnit.between(zonedDateTime, now)

                return difference >= constraintAnnotation.value
            }
            else -> {
                log.warn("MinIntervalFromNow annotation works only with ZonedDateTime, Date and Long values, but provided value is instance of ${value.javaClass.name}. This value is considered to be invalid.")

                return false
            }
        }
    }

}
