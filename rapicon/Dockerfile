# Use Java 17 runtime as base image
#FROM openjdk:17-jdk-slim AS build
FROM eclipse-temurin:17-jdk-jammy AS build

# Set working directory inside container
WORKDIR /app

# Copy Maven wrapper and pom.xml first (for dependency caching)
COPY mvnw pom.xml ./
COPY .mvn .mvn

# Make mvnw executable
RUN chmod +x ./mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy the source code
COPY src ./src

# Package the application (skip tests for faster builds)
RUN ./mvnw package -DskipTests

# Use a smaller runtime image for production
FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port your app runs on
EXPOSE 5000

# Run the Spring Boot jar
ENTRYPOINT ["java", "-jar", "app.jar"]