package chatox.platform.pagination;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.function.Function;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaginationRequest {
    private Integer page;
    private Integer pageSize;
    private String direction;
    private String sortBy;

    public PageRequest toPageRequest() {
        return PageRequest.of(page, pageSize, Sort.Direction.fromString(direction), sortBy);
    }

    public PageRequest toPageRequest(Function<String, String> sortByMapper) {
        return PageRequest.of(page, pageSize, Sort.Direction.fromString(direction), sortByMapper.apply(sortBy));
    }
}
