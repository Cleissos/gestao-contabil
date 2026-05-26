package com.PortalContabil.repository;

import com.PortalContabil.model.Contador;
import com.PortalContabil.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ContadorRepository extends JpaRepository<Contador, UUID> {

    // Busca o perfil do contador pelo login (User)
    Optional<Contador> findByUserAccount(User userAccount);

    // Busca pelo CRC caso precise validar algo específico
    Optional<Contador> findByRegistroProfissional(String registroProfissional);


}
