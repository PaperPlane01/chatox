package chatox.chat.support.exception

import chatox.chat.exception.metadata.MetadataEnhancedException
import org.springframework.boot.web.reactive.error.DefaultErrorAttributes
import org.springframework.web.reactive.function.server.ServerRequest

class CustomErrorAttributes : DefaultErrorAttributes() {
    override fun getErrorAttributes(webRequest: ServerRequest?, includeStackTrace: Boolean): MutableMap<String, Any> {
        val errorAttributes = super.getErrorAttributes(webRequest, includeStackTrace)
        val error = getError(webRequest)

        if (error is MetadataEnhancedException) {
            errorAttributes["metadata"] = error.metadata
        }

        return errorAttributes
    }
}
