package chatox.wallet.service.impl;

import chatox.platform.pagination.PaginationRequest;
import chatox.platform.security.web.AuthenticationHolder;
import chatox.wallet.api.request.CreateRewardRequest;
import chatox.wallet.api.request.UpdateRewardRequest;
import chatox.wallet.api.response.CurrentUserRewardResponse;
import chatox.wallet.api.response.RewardResponse;
import chatox.wallet.exception.RewardNotFoundException;
import chatox.wallet.mapper.RewardMapper;
import chatox.wallet.model.Reward;
import chatox.wallet.model.RewardClaim;
import chatox.wallet.model.User;
import chatox.wallet.repository.RewardClaimRepository;
import chatox.wallet.repository.RewardRepository;
import chatox.wallet.service.RewardService;
import chatox.wallet.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class RewardServiceImpl implements RewardService {
    private final RewardRepository rewardRepository;
    private final RewardClaimRepository rewardClaimRepository;
    private final UserService userService;
    private final AuthenticationHolder<User> authenticationHolder;
    private final RewardMapper rewardMapper;

    @Override
    public List<RewardResponse> getAllRewards(PaginationRequest paginationRequest) {
        return rewardRepository.findAll(paginationRequest.toPageRequest())
                .stream()
                .map(rewardMapper::toRewardResponse)
                .toList();
    }

    @Override
    public List<RewardResponse> getActiveRewards(PaginationRequest paginationRequest) {
        return rewardRepository.getActiveRewards(paginationRequest.toPageRequest())
                .stream()
                .map(rewardMapper::toRewardResponse)
                .toList();
    }

    @Override
    public RewardResponse createReward(CreateRewardRequest createRewardRequest) {
        var currentUser = authenticationHolder.requireCurrentUser();

        User rewardedUser = null;

        if (createRewardRequest.getUserId() != null) {
            rewardedUser = userService.requireUserById(createRewardRequest.getUserId());
        }

        var reward = Reward.builder()
                .id(UUID.randomUUID().toString())
                .currency(createRewardRequest.getCurrency())
                .createdAt(ZonedDateTime.now())
                .createdBy(currentUser)
                .minRewardValue(createRewardRequest.getMinRewardValue())
                .maxRewardValue(createRewardRequest.getMaxRewardValue())
                .recurringPeriodUnit(createRewardRequest.getRecurringPeriodUnit())
                .recurringPeriodValue(createRewardRequest.getRecurringPeriodValue())
                .periodStart(createRewardRequest.getPeriodStart())
                .periodEnd(createRewardRequest.getPeriodEnd())
                .useIntegersOnly(createRewardRequest.isUseIntegersOnly())
                .rewardedUser(rewardedUser)
                .active(createRewardRequest.isActive())
                .build();
        rewardRepository.save(reward);

        return rewardMapper.toRewardResponse(reward);
    }

    @Override
    public RewardResponse updateReward(String id, UpdateRewardRequest updateRewardRequest) {
        var reward = requireRewardById(id);
        var currentUser = authenticationHolder.requireCurrentUser();

        User rewardedUser = null;

        if (updateRewardRequest.getUserId() != null) {
            rewardedUser = userService.requireUserById(updateRewardRequest.getUserId());
        }


        reward.setCurrency(updateRewardRequest.getCurrency());
        reward.setMinRewardValue(updateRewardRequest.getMinRewardValue());
        reward.setMaxRewardValue(updateRewardRequest.getMaxRewardValue());
        reward.setRecurringPeriodUnit(updateRewardRequest.getRecurringPeriodUnit());
        reward.setRecurringPeriodValue(updateRewardRequest.getRecurringPeriodValue());
        reward.setPeriodStart(updateRewardRequest.getPeriodStart());
        reward.setPeriodEnd(updateRewardRequest.getPeriodEnd());
        reward.setUseIntegersOnly(updateRewardRequest.isUseIntegersOnly());
        reward.setRewardedUser(rewardedUser);
        reward.setActive(updateRewardRequest.isActive());
        reward.setUpdatedAt(ZonedDateTime.now());
        reward.setUpdatedBy(currentUser);

        rewardRepository.save(reward);

        return rewardMapper.toRewardResponse(reward);
    }

    public Reward requireRewardById(String id) {
        return rewardRepository.findById(id).orElseThrow(() -> new RewardNotFoundException(id));
    }

    @Override
    public Reward requireActiveRewardById(String id) {
        return rewardRepository.getActiveRewardById(id).orElseThrow(() -> new RewardNotFoundException(id));
    }

    @Override
    public List<CurrentUserRewardResponse> getAvailableRewardsForCurrentUser() {
        var currentUserId = authenticationHolder.requireCurrentUserDetails().getId();
        var availableRewards = rewardRepository.getAvailableRewardsForUser(currentUserId);

        var recurringRewards = availableRewards.stream()
                .filter(reward -> reward.getRecurringPeriodValue() != null)
                .toList();
        var recurringRewardClaims = recurringRewards.stream()
                .map(reward -> rewardClaimRepository.findTopByUserIdAndRewardOrderByCreatedAtDesc(
                        currentUserId,
                        reward
                ))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toMap(
                        rewardClaim -> rewardClaim.getReward().getId(),
                        Function.identity()
                ));

        return availableRewards.stream()
                .map(reward -> rewardMapper.toCurrentUserRewardResponse(
                        reward,
                        Optional.ofNullable(recurringRewardClaims.get(reward.getId()))
                                .map(RewardClaim::getCreatedAt)
                                .orElse(null)
                ))
                .toList();
    }
}
