package com.PortalContabil.repository;

import com.PortalContabil.model.Cliente;
import com.PortalContabil.model.Contador;
import com.PortalContabil.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClienteRepository extends JpaRepository<Cliente, UUID> {
    // Retorna todos os clientes vinculados a um contador específico
    List<Cliente> findByContador(Contador contador);


    // Busca o perfil do cliente pelo login dele
    Optional<Cliente> findByUserAccount(User userAccount);
}
