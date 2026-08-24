FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy custom Maven settings to use checksum warn policy (avoids Tag mismatch on some networks)
COPY maven-settings.xml /root/.m2/settings.xml

COPY pom.xml .

# Pre-download all dependencies; use checksum warn mode (-C) to skip checksum failures
RUN mvn dependency:go-offline -B \
    -Dmaven.artifact.threads=1 \
    -Dmaven.wagon.http.ssl.insecure=true \
    -Dmaven.wagon.http.ssl.allowall=true \
    -C || true

COPY src ./src

RUN mvn clean package -DskipTests -B \
    -Dmaven.artifact.threads=1 \
    -Dmaven.wagon.http.ssl.insecure=true \
    -Dmaven.wagon.http.ssl.allowall=true \
    -C


FROM eclipse-temurin:17-jre

WORKDIR /app

RUN mkdir -p /app/uploads/products

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENV JAVA_OPTS="-Xms256m -Xmx512m"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]