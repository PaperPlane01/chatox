package chatox.user.service

import chatox.user.config.property.UserInteractionCostConfigProperties
import chatox.user.domain.UserInteractionCost
import chatox.user.repository.UserInteractionCostRepository
import jakarta.annotation.PostConstruct
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.bson.types.ObjectId
import org.slf4j.LoggerFactory
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.ApplicationContextEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import java.time.ZonedDateTime
import java.util.function.Function
import java.util.stream.Collectors

@Service
class UserInteractionCostInitializer(
        private val userInteractionCostRepository: UserInteractionCostRepository,
        private val config: UserInteractionCostConfigProperties) {
    private val log = LoggerFactory.getLogger(this.javaClass)

    @EventListener(ApplicationReadyEvent::class)
    fun createUserInteractionsCosts() {
        mono {
            if (!config.createOnApplicationStart || config.userInteractionCosts.isEmpty()) {
                return@mono
            }

            log.info("Creating  and updating user interactions costs from config: ${config.userInteractionCosts}")

            val types = config.userInteractionCosts.keys.toList()
            val configuredUserInteractionCosts = config.userInteractionCosts
                    .map { (type, cost) -> UserInteractionCost(
                            id = ObjectId().toHexString(),
                            cost = cost,
                            type = type,
                            createdAt = ZonedDateTime.now()
                    ) }
            val existingUserInteractionCosts = userInteractionCostRepository
                    .findByTypeIn(types)
                    .collectList()
                    .awaitFirst()

            if (existingUserInteractionCosts.isEmpty()) {
                log.info("Saving user interaction costs: $configuredUserInteractionCosts")
                userInteractionCostRepository.saveAll(configuredUserInteractionCosts)
                        .collectList()
                        .awaitFirst()
            } else {
                val existingInteractionCostsMap = existingUserInteractionCosts.stream()
                        .collect(Collectors.toMap( {it.type}, Function.identity() ))
                val userInteractionsCostsToCreate = configuredUserInteractionCosts
                        .filter { !existingInteractionCostsMap.keys.contains(it.type) }
                val userInteractionCostsToUpdate = mutableListOf<UserInteractionCost>()

                if (config.updateExisting) {
                    val configuredUserInteractionCostsMap = configuredUserInteractionCosts.stream()
                            .collect(Collectors.toMap( {it.type}, Function.identity()))
                    existingUserInteractionCosts.forEach { userInteractionCost ->
                        if (configuredUserInteractionCostsMap.containsKey(userInteractionCost.type)) {
                            val configuredUserInteractionCost = configuredUserInteractionCostsMap[userInteractionCost.type]!!
                            userInteractionCostsToUpdate.add(userInteractionCost.copy(
                                    cost = configuredUserInteractionCost.cost,
                                    updatedById = null,
                                    updatedAt = ZonedDateTime.now()
                            ))
                        }
                    }
                }

                log.info("${userInteractionsCostsToCreate.size} user interactions costs will be created and " +
                        "${userInteractionCostsToUpdate.size} will be updated")

                if (userInteractionsCostsToCreate.isNotEmpty()) {
                    log.info("Creating user interactions costs $userInteractionsCostsToCreate")
                    userInteractionCostRepository.saveAll(userInteractionsCostsToCreate).awaitFirst()
                }

                if (userInteractionCostsToUpdate.isNotEmpty()) {
                    log.info("Updating user interactions costs $userInteractionCostsToUpdate")
                    userInteractionCostRepository.saveAll(userInteractionCostsToUpdate).awaitFirst()
                }
            }
        }
                .subscribe()
    }
}