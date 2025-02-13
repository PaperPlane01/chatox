package chatox.oauth2.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class ScopeAlreadyExistsException extends RuntimeException {
    public ScopeAlreadyExistsException() {
    }

    public ScopeAlreadyExistsException(String name) {
        super("Scope " + name + " already exists");
    }

}
