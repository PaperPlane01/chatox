package chatox.oauth2.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class OldEmailMissingException extends RuntimeException {

    public OldEmailMissingException() {
        super("This account has e-mail, so it's required to pass old email along with change email confirmation" +
                " code and its id");
    }
}
