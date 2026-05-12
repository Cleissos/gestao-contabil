package com.PortalContabil.repository;

import com.PortalContabil.model.Mensagem;
import com.PortalContabil.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MensagemRepository extends JpaRepository<Mensagem, UUID> {

    // Recupera o histórico de conversas entre dois usuários [cite: 1342]
    List<Mensagem> findByRemetenteAndDestinatarioOrDestinatarioAndRemetenteOrderByDataEnvioAsc(User remetente, User destinatario, User dest2, User rem2);
}
