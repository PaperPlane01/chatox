package chatox.user.support.pagination.annotation

annotation class Page(
        val min: Int = 0,
        val required: Boolean = false,
        val default: Int = 0
)
