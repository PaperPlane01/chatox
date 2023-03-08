package chatox.chat.support

import chatox.chat.model.User
import org.springframework.stereotype.Component

@Component
class UserDisplayedNameHelper {

    fun getDisplayedName(user: User): String {
        return if (user.lastName == null) {
            user.firstName
        } else {
            "${user.firstName} ${user.lastName!!}"
        }
    }
}
