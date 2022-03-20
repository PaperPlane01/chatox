package chatox.chat.util

import chatox.chat.model.UserBlacklistItem

fun generateBlacklistItemCacheId(userBlacklistItem: UserBlacklistItem) = generateCacheBlacklistItemCacheId(
        userId = userBlacklistItem.userId,
        blacklistedById = userBlacklistItem.blacklistedById
)

fun generateCacheBlacklistItemCacheId(userId: String, blacklistedById: String) = "$userId-$blacklistedById"