package com.PortalContabil.repository;

import com.PortalContabil.model.Mensagem;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface MensagemRepository extends JpaRepository<Mensagem, UUID> {

    // Busca a conversa entre dois usuários (A para B ou B para A) ordenada por data
    @Query("SELECT m FROM Mensagem m WHERE " +
            "(m.remetente.id = :id1 AND m.destinatario.id = :id2) OR " +
            "(m.remetente.id = :id2 AND m.destinatario.id = :id1) " +
            "ORDER BY m.dataEnvio ASC")
    List<Mensagem> findChatHistory(@Param("id1") UUID id1, @Param("id2") UUID id2);

    // Conta mensagens não lidas de um remetente específico para o destinatário logado
    @Query("SELECT COUNT(m) FROM Mensagem m WHERE m.destinatario.id = :destId AND m.remetente.id = :remId AND m.lida = false")
    long countUnreadFromUser(@Param("destId") UUID destId, @Param("remId") UUID remId);

    // Marca todas as mensagens de uma conversa como lidas
    @Modifying
    @Transactional
    @Query("UPDATE Mensagem m SET m.lida = true, m.dataLeitura = :now WHERE m.destinatario.id = :destId AND m.remetente.id = :remId AND m.lida = false")
    void markAsRead(@Param("destId") UUID destId, @Param("remId") UUID remId, @Param("now") LocalDateTime now);

    // Busca o resumo de todas as conversas ativas para o usuário logado
    @Query("SELECT m.remetente.id as remetenteId, m.remetente.nome as nomeRemetente, " +
            "m.conteudo as ultimaMensagem, m.dataEnvio as dataEnvio, " +
            "(SELECT COUNT(m2) FROM Mensagem m2 WHERE m2.remetente.id = m.remetente.id AND m2.destinatario.id = :usuarioId AND m2.lida = false) as qtdNaoLidas " +
            "FROM Mensagem m WHERE m.destinatario.id = :usuarioId " +
            "AND m.dataEnvio = (SELECT MAX(m3.dataEnvio) FROM Mensagem m3 WHERE m3.remetente.id = m.remetente.id AND m3.destinatario.id = :usuarioId) " +
            "ORDER BY m.dataEnvio DESC")
    List<Map<String, Object>> findResumoConversas(@Param("usuarioId") UUID usuarioId);

    // No MensagemRepository.java
    @Query("SELECT COUNT(m) FROM Mensagem m WHERE m.destinatario.id = :usuarioId AND m.lida = false")
    long countTotalUnread(@Param("usuarioId") UUID usuarioId);
}
