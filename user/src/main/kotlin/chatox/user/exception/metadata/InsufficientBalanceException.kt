package chatox.user.exception.metadata

import chatox.platform.exception.metadata.ExceptionMetadata
import chatox.platform.exception.metadata.MetadataEnhancedException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus
import java.math.BigDecimal

@ResponseStatus(HttpStatus.PAYMENT_REQUIRED)
class InsufficientBalanceException(requiredAmount: BigDecimal, actualAmount: BigDecimal) : MetadataEnhancedException(
        ExceptionMetadata.builder()
                .errorCode("INSUFFICIENT_BALANCE")
                .additional(mutableMapOf(
                        Pair("requiredAmount", requiredAmount.toString()),
                        Pair("actualAmount", actualAmount.toString())
                ))
                .build()
)