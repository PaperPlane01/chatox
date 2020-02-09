FROM openjdk:12 as build
WORKDIR /workspace/app

COPY gradlew .
COPY .gradle .gradle
COPY build.gradlew.kts build.gradle.kts
COPY settings.gradle.kts settings.gradle.kts
RUN ./gradlew build

RUN mkdir -p build/dependency && (cd build/dependency; jar -xf ../libs/*.jar)

FROM openjdk:12
VOLUME /tmp
ARG DEPENDENCY=/workspace/app/target/dependency
COPY --from=build ${DEPENDENCY}/BOOT-INF/lib /app/lib
COPY --from=build ${DEPENDENCY}/META-INF /app/META-INF
COPY --from=build ${DEPENDENCY}/BOOT-INF/classes /app
