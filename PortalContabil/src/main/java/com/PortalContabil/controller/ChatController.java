package com.PortalContabil.controller;

import com.PortalContabil.dto.MensagemDTO;
import com.PortalContabil.model.Mensagem;
import com.PortalContabil.model.User;
import com.PortalContabil.repository.MensagemRepository;
import com.PortalContabil.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.Map;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MensagemRepository mensagemRepository;

    @Autowired
    private UserRepository userRepository;

    @MessageMapping("/chat")
    public void processMessage(@Payload MensagemDTO mensagemDto) {
        // Busca as referências dos usuários
        User remetente = userRepository.getReferenceById(mensagemDto.remetenteId());
        User destinatario = userRepository.getReferenceById(mensagemDto.destinatarioId());

        // Cria e salva a nova mensagem no banco
        Mensagem novaMensagem = new Mensagem();
        novaMensagem.setConteudo(mensagemDto.conteudo());
        novaMensagem.setRemetente(remetente);
        novaMensagem.setDestinatario(destinatario);
        novaMensagem.setDataEnvio(LocalDateTime.now());

        Mensagem salva = mensagemRepository.save(novaMensagem);

        // Prepara o payload simplificado para evitar erros de serialização JSON (Recursão)
        // Isso garante que o Frontend receba exatamente o que precisa
        Map<String, Object> response = Map.of(
                "id", salva.getId(),
                "conteudo", salva.getConteudo(),
                "dataEnvio", salva.getDataEnvio().toString(),
                "remetente", Map.of("id", remetente.getId()),
                "destinatario", Map.of("id", destinatario.getId()),
                "lida", salva.isLida() // ADICIONE ESTA LINHA
        );

        // 1. Envia para o Destinatário na fila privada
        messagingTemplate.convertAndSendToUser(
                destinatario.getId().toString(),
                "/queue/messages",
                response
        );

        // 2. Envia para o Remetente (Confirmação de recebimento/sincronização multi-dispositivo)
        messagingTemplate.convertAndSendToUser(
                remetente.getId().toString(),
                "/queue/messages",
                response
        );
    }
}
