package chatox.platform.util;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public class Maps {

    public static <K, V> Map<K, V> toMap(List<Map.Entry<K, V>> entries) {
        var map = new HashMap<K, V>();
        entries.forEach(entry -> map.put(entry.getKey(), entry.getValue()));
        return map;
    }

    public static <K, V> Map<K, V> toMap(List<V> values, Function<V, K> extractKey) {
        var entries = values.stream()
                .map(value -> Map.entry(extractKey.apply(value), value))
                .collect(Collectors.toList());

        return toMap(entries);
    }
}
