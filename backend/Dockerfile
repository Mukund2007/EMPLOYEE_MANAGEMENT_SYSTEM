# ── STAGE 1: MAVEN BUILDER CONTAINER ──────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy pom.xml and download dependencies (optimizes caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and package the JAR archive
COPY src ./src
RUN mvn clean package -DskipTests

# ── STAGE 2: RUNTIME ECLIPSE TEMURIN CONTAINER ────────────────
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# Force TLS 1.2 at JVM level (Aiven MySQL requires TLS 1.2+)
# -Djdk.tls.client.protocols=TLSv1.2 forces the JVM to only use TLS 1.2
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -Djdk.tls.client.protocols=TLSv1.2 -Dhttps.protocols=TLSv1.2"
ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

