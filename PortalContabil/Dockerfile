# Etapa 1: Compilação (Build) com Java 21
FROM maven:3.8.8-amazoncorretto-21 AS build
COPY . .
RUN mvn clean package -DskipTests

# Etapa 2: Execução com Java 21
FROM amazoncorretto:21
COPY --from=build /target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]