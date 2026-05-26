# Etapa 1: Compilação (Build)
FROM maven:3.8.8-amazoncorretto-17 AS build
COPY . .
RUN mvn clean package -DskipTests

# Etapa 2: Execução
FROM amazoncorretto:17
COPY --from=build /target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]