# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests


# Run stage
FROM eclipse-temurin:17-jdk-alpine

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Change ownership
RUN chown -R appuser:appgroup /app

# Switch user
USER appuser

ENTRYPOINT ["java", "-jar", "app.jar"]
