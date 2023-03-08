package chatox.chat.model

interface ChatFeatureData<T> {
    val enabled: Boolean
    val additional: T
}