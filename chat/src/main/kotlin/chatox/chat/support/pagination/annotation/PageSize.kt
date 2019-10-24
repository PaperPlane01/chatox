package chatox.chat.support.pagination.annotation

annotation class PageSize(
        val min: Int = 1,
        val max: Int = 150,
        val default: Int = 50,
        val required: Boolean = false
)
