package chatox.oauth2.service.impl;

import chatox.oauth2.service.TimeService;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;

@Service
public class TimeServiceImpl implements TimeService {
    @Override
    public ZonedDateTime now() {
        return ZonedDateTime.now();
    }
}
