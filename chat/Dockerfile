FROM openjdk:12 as build
WORKDIR /workspace/app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src .

RUN ./mvnw dependency:resolve
RUN ./mvnw package -DskipTests

RUN mkdir target/dependencies && (cd target/dependencies; jar -xf ../*.jar)

FROM opendjk:12
VOLUME /tmp
ARG DEPENDENCIES=/workspace/app/target/dependencies
COPY --from=build ${DEPENDENCIES}/BOOT-INF/lib /app/lib
COPY --from=build ${DEPENDENCIES}/META-INF /app/META-INF
COPY --from=build ${DEPENDENCIES}/BOOT-INF/classes /app

ENTRYPOINT ["java", "-cp", "app:app/lib", "chatox.chat.ChatServiceApplication"]
