package chatox.oauth2.service.impl;

import chatox.oauth2.api.request.CreateConfirmationTokenRequest;
import chatox.oauth2.api.response.ConfirmationTokenResponse;
import chatox.oauth2.respository.AccountRepository;
import chatox.oauth2.security.AuthenticationFacade;
import chatox.oauth2.service.ConfirmationTokenService;
import chatox.platform.security.confirmation.ConfirmationTokenClaim;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;

@Service
@RequiredArgsConstructor
public class ConfirmationTokenServiceImpl implements ConfirmationTokenService {
    private final AccountRepository accountRepository;
    private final AuthenticationFacade authenticationFacade;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;

    @Value("${spring.application.name}")
    private final String applicationName;

    @Override
    public ConfirmationTokenResponse createConfirmationToken(
            CreateConfirmationTokenRequest createConfirmationTokenRequest) {
        var currentAccount = authenticationFacade.getCurrentUserDetails();
        var account = accountRepository.findById(currentAccount.getAccountId())
                .orElseThrow(() -> new BadCredentialsException("Bad credentials"));

        if (!passwordEncoder.matches(createConfirmationTokenRequest.getPassword(), account.getPasswordHash())) {
            throw new BadCredentialsException("Bad credentials");
        }

        var issueDate = ZonedDateTime.now();
        var expirationDate = issueDate.plusMinutes(10);
        var claims = JwtClaimsSet.builder()
                .claim(ConfirmationTokenClaim.ACTIONS.getValue(), createConfirmationTokenRequest.getActions())
                .claim(ConfirmationTokenClaim.USER_ID.getValue(), currentAccount.getUserId())
                .id(currentAccount.getUserId())
                .issuedAt(issueDate.toInstant())
                .expiresAt(expirationDate.toInstant())
                .issuer(applicationName)
                .build();
        var token = jwtEncoder.encode(JwtEncoderParameters.from(claims));

        return ConfirmationTokenResponse.builder()
                .confirmationToken(token.getTokenValue())
                .expiresAt(expirationDate)
                .build();
    }
}
