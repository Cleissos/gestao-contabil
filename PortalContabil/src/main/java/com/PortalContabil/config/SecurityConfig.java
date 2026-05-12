package com.PortalContabil.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    SecurityFilter securityFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
       return http
               .cors(Customizer.withDefaults())// Ativa a configuração de CORS definida abaixo
                .csrf(csrf -> csrf.disable()) // Desabilita CSRF (comum em APIs REST)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // API sem estado (Stateless)
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.POST, "/auth/login").permitAll() // Permite login sem estar logado
                        .requestMatchers(HttpMethod.POST, "/auth/register/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/documentos/download/**").hasAnyRole("CLIENTE", "CONTADOR")

                        // IMPORTANTE: Permissões para Documentos
                        // O Cliente pode enviar (POST) e ver os seus (GET /meus)
                        .requestMatchers("/documentos/meus").hasRole("CLIENTE")
                        .requestMatchers(HttpMethod.POST, "/documentos/**").hasAnyRole("CLIENTE", "CONTADOR")

                        // O Contador pode ver documentos de clientes específicos
                        .requestMatchers("/documentos/cliente/**").hasRole("CONTADOR")

                        // Se você estiver usando o @PreAuthorize lá no Controller,
                        // você ainda precisa garantir que a requisição passe por aqui:
                        .anyRequest().authenticated() // Bloqueia todo o resto
                )
               .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    // Configuração detalhada do CORS para IHC e Segurança
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173")); // Origem do seu vite
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);

        // ADICIONE ESTA LINHA ABAIXO:
        configuration.setExposedHeaders(Arrays.asList("Content-Type", "Content-Disposition"));

        UrlBasedCorsConfigurationSource source = new  UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Define o BCrypt como padrão para as senhas
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
