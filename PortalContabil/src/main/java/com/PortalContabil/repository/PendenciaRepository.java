package com.PortalContabil.repository;

import com.PortalContabil.model.Cliente;
import com.PortalContabil.model.Pendencia;
import com.PortalContabil.model.enums.StatusPendencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PendenciaRepository extends JpaRepository<Pendencia, UUID> {

    // Busca para o Dashboard por status
    List<Pendencia> findByClienteAndStatus(Cliente cliente, StatusPendencia status);

    // Busca todas as pendências de um cliente específico (Visão do Cliente)
    List<Pendencia> findByCliente(Cliente cliente);
}
