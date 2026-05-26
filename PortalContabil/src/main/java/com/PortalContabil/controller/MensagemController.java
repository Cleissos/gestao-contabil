package com.PortalContabil.controller;

import com.PortalContabil.model.Mensagem;
import com.PortalContabil.model.User;
import com.PortalContabil.repository.MensagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/messages")
public class MensagemController {

    @Autowired
    private MensagemRepository mensagemRepository;

    @GetMapping("/historico/{id1}/{id2}")
    public ResponseEntity<List<Mensagem>> getHistorico(@PathVariable UUID id1, @PathVariable UUID id2) {
        // Usa o método que criamos no MensagemRepository anteriormente
        List<Mensagem> historico = mensagemRepository.findChatHistory(id1, id2);
        return ResponseEntity.ok(historico);
    }

    // ADICIONE ESTE MÉTODO PARA RESOLVER O ERRO 403 E ATUALIZAR OS TRACINHOS
    @PutMapping("/ler/{destId}/{remId}")
    @Transactional
    public ResponseEntity<Void> marcarComoLida(@PathVariable UUID destId, @PathVariable UUID remId) {
        // Chamando o método que definimos no Repository
        mensagemRepository.markAsRead(destId, remId, LocalDateTime.now());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/resumo")
    public ResponseEntity<List<Map<String, Object>>> getResumoConversas() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Em vez de auth.getName(), vamos pegar o ID do objeto User principal
        // Isso evita tentar dar parse em "PA02561"
        Object principal = auth.getPrincipal();
        UUID usuarioLogadoId;

        if (principal instanceof User) { // Certifique-se de importar sua classe User
            usuarioLogadoId = ((User) principal).getId();
        } else {
            // Fallback caso o principal seja apenas uma String (token antigo)
            String name = auth.getName();
            try {
                usuarioLogadoId = UUID.fromString(name);
            } catch (IllegalArgumentException e) {
                // Se cair aqui, é porque o token é inválido/antigo
                return ResponseEntity.status(401).build();
            }
        }

        List<Map<String, Object>> resumo = mensagemRepository.findResumoConversas(usuarioLogadoId);
        return ResponseEntity.ok(resumo);
    }

    @GetMapping("/total-nao-lidas")
    public ResponseEntity<Long> getTotalUnread() {
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        // Use a mesma lógica que funcionou no /resumo para pegar o UUID
//        UUID usuarioId = UUID.fromString(auth.getName());
//        return ResponseEntity.ok(mensagemRepository.countTotalUnread(usuarioId));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Pegamos o objeto User que você definiu no SecurityFilter
        // Isso é muito mais seguro que tentar converter uma String manualmente
        if (auth.getPrincipal() instanceof User user) {
            return ResponseEntity.ok(mensagemRepository.countTotalUnread(user.getId()));
        }

        // Caso não encontre o usuário logado por algum motivo
        return ResponseEntity.status(401).build();
    }
}
