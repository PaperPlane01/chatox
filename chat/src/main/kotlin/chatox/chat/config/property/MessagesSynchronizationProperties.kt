package chatox.chat.config.property

data class MessagesSynchronizationProperties(
    var syncOnStart: Boolean = false,
    var deleteBeforeImport: Boolean = false
)