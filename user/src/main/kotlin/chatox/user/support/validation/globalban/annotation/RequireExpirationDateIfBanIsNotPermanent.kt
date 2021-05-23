package chatox.user.support.validation.globalban.annotation

import javax.validation.Payload
import kotlin.reflect.KClass

@Target(allowedTargets = [AnnotationTarget.CLASS])
@Retention(value = AnnotationRetention.RUNTIME)
annotation class RequireExpirationDateIfBanIsNotPermanent(
    val message: String = "Global ban expiration date must be provided if ban is not permanent",
    val expirationDateField: String = "expiresAt",
    val permanentField: String = "permanent",

    val groups: Array<KClass<*>> = [],
    val payload: Array<KClass<out Payload>> = []
)
