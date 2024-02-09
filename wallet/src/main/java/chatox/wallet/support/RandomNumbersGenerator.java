package chatox.wallet.support;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.security.SecureRandom;

@Component
public class RandomNumbersGenerator {
    private final SecureRandom random = new SecureRandom();

    public BigInteger randomBigInteger(BigInteger lowerBound, BigInteger upperBound) {
        if (lowerBound.equals(upperBound)) {
            return upperBound;
        }

        var randomNumber = new BigInteger(upperBound.bitLength(), random);

        while (randomNumber.compareTo(lowerBound) <= 0 || randomNumber.compareTo(upperBound) >= 0) {
            randomNumber = new BigInteger(upperBound.bitLength(), random);
        }

        return randomNumber;
    }

    public BigDecimal randomBigDecimal(BigDecimal lowerBound, BigDecimal upperBound) {
        if (lowerBound.equals(upperBound)) {
            return upperBound;
        }

        return lowerBound.add(
                BigDecimal.valueOf(random.nextDouble()).multiply(upperBound.subtract(lowerBound))
        );
    }
}
