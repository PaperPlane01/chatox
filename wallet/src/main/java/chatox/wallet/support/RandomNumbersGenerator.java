package chatox.wallet.support;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.security.SecureRandom;

@Component
public class RandomNumbersGenerator {
    private final SecureRandom random = new SecureRandom();

    public BigInteger randomBigInteger(BigInteger lowerBound, BigInteger upperBound) {
        return lowerBound.add(
                BigInteger.valueOf(random.nextInt()).multiply(upperBound.subtract(lowerBound))
        );
    }

    public BigDecimal randomBigDecimal(BigDecimal loweBound, BigDecimal upperBound) {
        return loweBound.add(
                BigDecimal.valueOf(random.nextDouble()).multiply(upperBound.subtract(loweBound))
        );
    }
}
