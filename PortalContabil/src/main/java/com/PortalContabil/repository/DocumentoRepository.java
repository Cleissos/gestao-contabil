package com.PortalContabil.repository;

import com.PortalContabil.model.Cliente;
import com.PortalContabil.model.Contador;
import com.PortalContabil.model.Documento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DocumentoRepository extends JpaRepository<Documento, UUID> {

    // Para o Cliente ver os seus próprios documentos
    List<Documento> findByCliente(Cliente cliente);

    // Para o Contador ver os documentos de toda a sua carteira de clientes
    List<Documento> findByContador(Contador contador);

    // Busca filtrada por período (Muito útil para o fechamento mensal)
    List<Documento> findByClienteAndMesAndAno(Cliente cliente, Integer mes, Integer ano);

    List<Documento> findByContadorOrderByDataUploadDesc(Contador contador);
}
