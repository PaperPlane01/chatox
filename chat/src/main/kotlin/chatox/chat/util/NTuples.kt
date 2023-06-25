package chatox.chat.util

data class NTuple2<T1, T2>(val t1: T1, val t2: T2) {
    fun <Target1, Target2> map(mapper: (NTuple2<T1, T2>) -> NTuple2<Target1, Target2>): NTuple2<Target1, Target2> {
        return mapper(this)
    }
}

data class NTuple3<T1, T2, T3>(val t1: T1, val t2: T2, val t3: T3) {
    fun <Target1, Target2, Target3> map(mapper: (NTuple3<T1, T2, T3>) -> NTuple3<Target1, Target2, Target3>): NTuple3<Target1, Target2, Target3> {
        return mapper(this)
    }
}

data class NTuple4<T1, T2, T3, T4>(val t1: T1, val t2: T2, val t3: T3, val t4: T4) {
    fun <Target1, Target2, Target3, Target4> map(mapper: (NTuple4<T1, T2, T3, T4>) -> NTuple4<Target1, Target2, Target3, Target4>): NTuple4<Target1, Target2, Target3, Target4> {
        return mapper(this)
    }
}

data class NTuple5<T1, T2, T3, T4, T5>(val t1: T1, val t2: T2, val t3: T3, val t4: T4, val t5: T5) {
    fun <Target1, Target2, Target3, Target4, Target5> map(mapper: (NTuple5<T1, T2, T3, T4, T5>) -> NTuple5<Target1, Target2, Target3, Target4, Target5>): NTuple5<Target1, Target2, Target3, Target4, Target5> {
        return mapper(this)
    }
}

data class NTuple6<T1, T2, T3, T4, T5, T6>(val t1: T1, val t2: T2, val t3: T3, val t4: T4, val t5: T5, val t6: T6) {
    fun <Target1, Target2, Target3, Target4, Target5, Target6> map(mapper: (NTuple6<T1, T2, T3, T4, T5, T6>) -> NTuple6<Target1, Target2, Target3, Target4, Target5, Target6>): NTuple6<Target1, Target2, Target3, Target4, Target5, Target6> {
        return mapper(this)
    }
}

data class NTuple7<T1, T2, T3, T4, T5, T6, T7>(val t1: T1, val t2: T2, val t3: T3, val t4: T4, val t5: T5, val t6: T6, val t7: T7) {
    fun <Target1, Target2, Target3, Target4, Target5, Target6, Target7> map(mapper: (NTuple7<T1, T2, T3, T4, T5, T6, T7>) -> NTuple7<Target1, Target2, Target3, Target4, Target5, Target6, Target7>): NTuple7<Target1, Target2, Target3, Target4, Target5, Target6, Target7> {
        return mapper(this)
    }
}
