package chatox.chat.model

data class DialogParticipant(
        val id: String,
        val userId: String,
        val userDisplayedName: String,
        val userSlug: String?
)
