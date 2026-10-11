package chatox.chat.model

data class AddReactionsFeatureData(
    override val enabled: Boolean = true,
    override val additional: AddReactionsFeatureAdditionalData = AddReactionsFeatureAdditionalData()
) : ChatFeatureData<AddReactionsFeatureAdditionalData>
