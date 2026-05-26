package com.PortalContabil.repository;

import com.PortalContabil.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    // Busca o usuário pelo CPF/CNPJ para autenticação
    Optional<User> findByLogin(String login);

    // Método para a recuperação de senha
    Optional<User> findByEmail(String email);

    // Método para validar se o token é legítimo
    Optional<User> findByTokenRecuperacao(String token);
}
