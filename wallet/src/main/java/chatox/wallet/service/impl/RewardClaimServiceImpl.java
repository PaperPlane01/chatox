package chatox.wallet.service.impl;

import chatox.platform.security.web.AuthenticationHolder;
import chatox.wallet.api.response.RewardClaimResponse;
import chatox.wallet.exception.RewardAlreadyClaimedException;
import chatox.wallet.exception.RewardedUserMismatchException;
import chatox.wallet.exception.metadate.RewardHasBeenClaimedRecentlyException;
import chatox.wallet.mapper.RewardClaimMapper;
import chatox.wallet.model.RewardClaim;
import chatox.wallet.model.User;
import chatox.wallet.repository.RewardClaimRepository;
import chatox.wallet.repository.RewardRepository;
import chatox.wallet.service.BalanceService;
import chatox.wallet.service.RewardClaimService;
import chatox.wallet.service.RewardService;
import chatox.wallet.support.RandomNumbersGenerator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class RewardClaimServiceImpl implements RewardClaimService {
    private final RewardClaimRepository rewardClaimRepository;
    private final RewardRepository rewardRepository;
    private final RewardService rewardService;
    private final BalanceService balanceService;
    private final AuthenticationHolder<User> authenticationHolder;
    private final RandomNumbersGenerator randomNumbersGenerator;
    private final RewardClaimMapper rewardClaimMapper;


    @Override
    public RewardClaimResponse claimReward(String rewardId) {
        var currentUser = authenticationHolder.requireCurrentUser();
        var reward = rewardService.requireActiveRewardById(rewardId);

        if (reward.getRewardedUser() != null) {
            if (!reward.getRewardedUser().getId().equals(currentUser.getId())) {
                throw new RewardedUserMismatchException();
            }

            if (reward.isClaimed()) {
                throw new RewardAlreadyClaimedException();
            }
        }

        if (reward.getRecurringPeriodValue() != null && reward.getRecurringPeriodUnit() != null) {
            var lastClaim = rewardClaimRepository.findTopByUserIdAndRewardOrderByCreatedAtDesc(
                    currentUser.getId(),
                    reward
            );

            lastClaim.ifPresent(claim -> {
                var nextDate = claim.getCreatedAt().plus(
                        reward.getRecurringPeriodValue(),
                        reward.getRecurringPeriodUnit()
                );
                System.out.println(nextDate.toEpochSecond());
                System.out.println(ZonedDateTime.now().toEpochSecond());
                System.out.println(nextDate);
                System.out.println(ZonedDateTime.now());

                if (ZonedDateTime.now().isBefore(nextDate)) {
                    throw new RewardHasBeenClaimedRecentlyException(nextDate);
                }
            });
        }

        var balance = balanceService.getBalanceOfCurrentUser(reward.getCurrency());
        BigDecimal claimedAmount;

        if (reward.isUseIntegersOnly()) {
            claimedAmount = new BigDecimal(randomNumbersGenerator.randomBigInteger(
                    reward.getMinRewardValue().toBigInteger(),
                    reward.getMaxRewardValue().toBigInteger()
            ));
        } else {
            claimedAmount = randomNumbersGenerator.randomBigDecimal(
                    reward.getMinRewardValue(),
                    reward.getMaxRewardValue()
            );
        }

        var rewardClaim = RewardClaim.builder()
                .id(UUID.randomUUID().toString())
                .reward(reward)
                .user(currentUser)
                .balance(balance)
                .claimedAmount(claimedAmount)
                .createdAt(ZonedDateTime.now())
                .build();

        rewardClaimRepository.save(rewardClaim);

        if (reward.getRewardedUser() != null) {
            reward.setClaimed(true);
            rewardRepository.save(reward);
        }

        balanceService.updateBalance(balance, rewardClaim);

        return rewardClaimMapper.toRewardClaimResponse(rewardClaim);
    }
}
