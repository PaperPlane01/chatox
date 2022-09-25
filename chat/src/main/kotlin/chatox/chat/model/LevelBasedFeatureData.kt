package chatox.chat.model

data class LevelBasedFeatureData(
        override val enabled: Boolean = false,
        override val additional: LevelBasedFeatureAdditionalData = LevelBasedFeatureAdditionalData()
) : ChatFeatureData<LevelBasedFeatureAdditionalData>