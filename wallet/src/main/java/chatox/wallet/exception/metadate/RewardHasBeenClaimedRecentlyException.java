package chatox.wallet.exception.metadate;

import chatox.platform.exception.metadata.ExceptionMetadata;
import chatox.platform.exception.metadata.MetadataEnhancedException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.time.ZonedDateTime;
import java.util.Map;

@ResponseStatus(HttpStatus.CONFLICT)
public class RewardHasBeenClaimedRecentlyException extends MetadataEnhancedException {
    public RewardHasBeenClaimedRecentlyException(ZonedDateTime nextDate) {
        super(
                "This reward has been claimed recently. Next date is: " + nextDate,
                ExceptionMetadata.builder()
                        .errorCode("REWARD_HAS_BEEN_CLAIMED_RECENTLY")
                        .additional(Map.of("nextDate", nextDate.toString()))
                        .build()
        );
    }
}
