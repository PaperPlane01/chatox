package chatox.chat.util

import reactor.core.publisher.Mono

fun runAsync(runnable: Runnable) {
    Mono.fromRunnable<Unit>(runnable).subscribe()
}
