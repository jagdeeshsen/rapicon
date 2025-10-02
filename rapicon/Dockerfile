# Use Java 17 runtime as base image
FROM openjdk:17-jdk-slim

# Set working directory inside container
WORKDIR /app

# Copy your jar file (after Maven build) into the container
COPY target/*.jar app.jar

# Run the Spring Boot jar
ENTRYPOINT ["java", "-jar", "app.jar"]
