package chatox.wallet.repository.custom.impl;

import chatox.wallet.model.Reward;
import chatox.wallet.repository.custom.RewardCustomRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.query.QueryUtils;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class RewardCustomRepositoryImpl implements RewardCustomRepository  {
    private final EntityManager entityManager;

    @Override
    public List<Reward> getAvailableRewardsForUser(String userId) {
        var criteriaBuilder = entityManager.getCriteriaBuilder();
        var query = criteriaBuilder.createQuery(Reward.class);
        var reward = query.from(Reward.class);

        query.where(
                criteriaBuilder.or(
                        criteriaBuilder.isNull(reward.get("rewardedUser")),
                        criteriaBuilder.and(
                                criteriaBuilder.equal(reward.get("rewardedUser").get("id"), userId),
                                criteriaBuilder.isFalse(reward.get("claimed"))
                        )
                ),
                createActiveRewardQuery(criteriaBuilder, reward)
        );

        return entityManager.createQuery(query).getResultList();
    }

    @Override
    public List<Reward> getActiveRewards(Pageable pageable) {
        var criteriaBuilder = entityManager.getCriteriaBuilder();
        var query = criteriaBuilder.createQuery(Reward.class);
        var reward = query.from(Reward.class);

        query.where(createActiveRewardQuery(criteriaBuilder, reward));

        var select = query.select(reward);
        select.orderBy(QueryUtils.toOrders(pageable.getSort(), reward, criteriaBuilder));

        var resultQuery = entityManager.createQuery(select);
        resultQuery.setMaxResults(pageable.getPageSize());
        resultQuery.setFirstResult(pageable.getPageNumber() * pageable.getPageSize());

        return resultQuery.getResultList();
    }

    @Override
    public Optional<Reward> getActiveRewardById(String id) {
        var criteriaBuilder = entityManager.getCriteriaBuilder();
        var query = criteriaBuilder.createQuery(Reward.class);
        var reward = query.from(Reward.class);

        query.where(criteriaBuilder.and(
                criteriaBuilder.equal(reward.get("id"), id),
                createActiveRewardQuery(criteriaBuilder, reward)
        ));

        return Optional
                .of(entityManager.createQuery(query).getResultList())
                .filter(list -> !list.isEmpty())
                .flatMap(list -> list.stream().findFirst());
    }

    private Predicate createActiveRewardQuery(CriteriaBuilder criteriaBuilder, Root<Reward> reward) {
        return criteriaBuilder.and(
                criteriaBuilder.isTrue(reward.get("active")),
                criteriaBuilder.or(
                        criteriaBuilder.isNull(reward.get("periodStart")),
                        criteriaBuilder.greaterThanOrEqualTo(reward.get("periodStart"), ZonedDateTime.now())
                ),
                criteriaBuilder.or(
                        criteriaBuilder.isNull(reward.get("periodEnd")),
                        criteriaBuilder.lessThanOrEqualTo(reward.get("periodEnd"), ZonedDateTime.now())
                )
        );
    }
}
