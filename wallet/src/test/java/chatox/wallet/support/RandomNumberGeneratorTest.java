package chatox.wallet.support;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.BigInteger;

import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("RandomNumberGenerator tests")
@Slf4j
class RandomNumberGeneratorTest {

    RandomNumbersGenerator randomNumbersGenerator = new RandomNumbersGenerator();

    static BigInteger BIG_INTEGER_LOWER_BOUND = BigInteger.ONE;
    static BigInteger BIG_INTEGER_UPPER_BOUND = BigInteger.valueOf(20);

    static BigDecimal BIG_DECIMAL_LOWER_BOUND = BigDecimal.ONE;
    static BigDecimal BIG_DECIMAL_UPPER_BOUND = BigDecimal.valueOf(20);

    @DisplayName("It generates random BigInteger in a given range")
    @Test
    void randomBigInteger() {
        for (int current = 0; current < 100; current++) {
            var random = randomNumbersGenerator.randomBigInteger(BIG_INTEGER_LOWER_BOUND, BIG_INTEGER_UPPER_BOUND);
            log.info("Generated BigInteger: {}", random);

            assertTrue(random.compareTo(BIG_INTEGER_LOWER_BOUND) >= 0);
            assertTrue(random.compareTo(BIG_INTEGER_UPPER_BOUND) <= 0);
        }
    }

    @DisplayName("It generates random BigDecimal in a given range")
    @Test
    void randomBigDecimal() {
        for (int current = 0; current < 100; current++) {
            var random = randomNumbersGenerator.randomBigDecimal(BIG_DECIMAL_LOWER_BOUND, BIG_DECIMAL_UPPER_BOUND);
            log.info("Generated BigDecimal: {}", random);

            assertTrue(random.compareTo(BIG_DECIMAL_LOWER_BOUND) >= 0);
            assertTrue(random.compareTo(BIG_DECIMAL_UPPER_BOUND) <= 0);
        }
    }
}
