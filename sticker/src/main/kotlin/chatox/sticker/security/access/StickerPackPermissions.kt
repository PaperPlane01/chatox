package chatox.sticker.security.access

import chatox.platform.security.jwt.JwtPayload
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.sticker.api.request.DeleteStickerPackRequest
import chatox.sticker.exception.metadata.StickerPackNotFoundException
import chatox.sticker.repository.StickerPackRepository
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class StickerPackPermissions(
    private val authenticationHolder: ReactiveAuthenticationHolder<JwtPayload>,
    private val stickerPackRepository: StickerPackRepository
) {

    fun canUpdateStickerPack(stickerPackId: String): Mono<Boolean> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val stickerPack = stickerPackRepository.findById(stickerPackId).awaitFirstOrNull()
                ?: throw StickerPackNotFoundException(stickerPackId)

            return@mono currentUser.id == stickerPack.createdBy
        }
    }

    fun canDeleteStickerPack(stickerPackId: String, request: DeleteStickerPackRequest?): Mono<Boolean> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val stickerPack = stickerPackRepository.findById(stickerPackId).awaitFirstOrNull()
                ?: throw StickerPackNotFoundException(stickerPackId)

            return@mono if (request?.deleteMessages == true) {
                currentUser.isAdmin
            } else {
                currentUser.id == stickerPack.createdBy || currentUser.isAdmin
            }
        }
    }
}