package chatox.chat.util

fun <SourceType, TargetType1, TargetType2> mapTo2Lists(
        list: List<SourceType>,
        mapFunction1: (SourceType) -> TargetType1,
        mapFunction2: (SourceType) -> TargetType2
): NTuple2<List<TargetType1>, List<TargetType2>> {
    if (list.isEmpty()) {
        return NTuple2(listOf(), listOf())
    }

   val result = list.map { item ->

        return@map NTuple2(mutableListOf(mapFunction1(item)), mutableListOf(mapFunction2(item)))
    }
            .reduce { accumulator, current ->
                accumulator.t1.addAll(current.t1)
                accumulator.t2.addAll(current.t2)

                return@reduce accumulator
            }

    return NTuple2(
            result.t1.toList(),
            result.t2.toList()
    )
}

inline fun <SourceType, TargetType1, TargetType2, TargetType3> mapTo3Lists(
        list: List<SourceType>,
        mapFunction1: (SourceType) -> TargetType1,
        mapFunction2: (SourceType) -> TargetType2,
        mapFunction3: (SourceType) -> TargetType3
): NTuple3<List<TargetType1>, List<TargetType2>, List<TargetType3>> {
    if (list.isEmpty()) {
        return NTuple3(listOf(), listOf(), listOf())
    }

    val result = list.map { item ->

        return@map NTuple3(
                mutableListOf(mapFunction1(item)),
                mutableListOf(mapFunction2(item)),
                mutableListOf(mapFunction3(item))
        )
    }
            .reduce { accumulator, current ->
                accumulator.t1.addAll(current.t1)
                accumulator.t2.addAll(current.t2)
                accumulator.t3.addAll(current.t3)

                return@reduce accumulator
            }

    return NTuple3(
            result.t1.toList(),
            result.t2.toList(),
            result.t3.toList()
    )
}

fun <T>splitTo2Lists(
        list: List<T>,
        condition1: (T) -> Boolean,
        condition2: (T) -> Boolean
): NTuple2<List<T>, List<T>> {
    if (list.isEmpty()) {
        return NTuple2(listOf(), listOf())
    }

    val list1 = mutableListOf<T>()
    val list2 = mutableListOf<T>()

    list.forEach { item ->
        if (condition1(item)) {
            list1.add(item)
        }

        if (condition2(item)) {
            list2.add(item)
        }
    }

    return NTuple2(list1.toList(), list2.toList())
}