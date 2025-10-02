# Use Java 17 runtime as base image
FROM openjdk:17-jdk-slim

# Set working directory inside container
WORKDIR /app

# Copy Maven wrapper and pom.xml first (for dependency caching)
COPY mvnw pom.xml ./
COPY .mvn .mvn

# Download dependencies (offline mode)
RUN ./mvnw dependency:go-offline -B

# Copy the source code
COPY src ./src

# Package the application (skip tests for faster builds)
RUN ./mvnw package -DskipTests

# Expose port your app runs on
EXPOSE 5000

# Copy your jar file (after Maven build) into the container
COPY target/*.jar app.jar

# Run the Spring Boot jar
ENTRYPOINT ["java", "-jar", "app.jar"]
