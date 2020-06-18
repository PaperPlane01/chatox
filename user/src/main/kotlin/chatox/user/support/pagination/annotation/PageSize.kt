package chatox.user.support.pagination.annotation

annotation class PageSize(
        val min: Int = 0,
        val max: Int = 150,
        val default: Int = 50,
        val required: Boolean = false
)
