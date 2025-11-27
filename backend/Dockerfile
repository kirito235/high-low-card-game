# Use Maven with JDK 22 to build
FROM maven:3.9-eclipse-temurin-22 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Use JRE 22 to run (smaller image)
FROM eclipse-temurin:22-jre
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

FROM alpine:latest

# Install curl
RUN apk add --no-cache curl

# Create script
RUN echo '#!/bin/sh' > /ping.sh && \
    echo 'echo "Pinging backend at: $BACKEND_URL"' >> /ping.sh && \
    echo 'curl -s -o /dev/null -w "Status: %{http_code}\n" "$BACKEND_URL"' >> /ping.sh && \
    chmod +x /ping.sh

CMD ["/ping.sh"]