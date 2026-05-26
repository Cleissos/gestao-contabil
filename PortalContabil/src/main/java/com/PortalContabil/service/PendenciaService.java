package com.PortalContabil.service;

import com.PortalContabil.dto.PendenciaDTO;
import com.PortalContabil.model.Cliente;
import com.PortalContabil.model.Pendencia;
import com.PortalContabil.model.enums.StatusPendencia;
import com.PortalContabil.repository.ClienteRepository;
import com.PortalContabil.repository.PendenciaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PendenciaService {

    @Autowired
    private PendenciaRepository pendenciaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private EmailService emailService; // 💡 INJETADO

    @Transactional
    public Pendencia criarPendencia(PendenciaDTO data) {
        Cliente cliente = clienteRepository.findById(data.clienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        Pendencia nova = new Pendencia();
        nova.setDescricao(data.descricao());
        nova.setPrazo(data.prazo());
        nova.setDataVencimento(data.dataVencimento()); // Alinhado com a Entity
        nova.setStatus(StatusPendencia.ABERTO);
        nova.setCliente(cliente);
        // arquivoUrl inicia nulo
        nova.setArquivoUrl(data.arquivoUrl());

        // 1º: Salva no banco de dados primeiro para garantir que o registro existe
        Pendencia salva = pendenciaRepository.save(nova);

        // 2º 📧 GATILHO DE NOTIFICAÇÃO: Agora a variável "salva" existe e pode ser usada com segurança
        try {
            String emailCliente = cliente.getUserAccount().getEmail();
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
            String prazoFormatado = salva.getPrazo().format(formatter);

            emailService.enviarEmailNovaPendencia(
                    emailCliente,
                    cliente.getNome(),
                    salva.getDescricao(),
                    prazoFormatado
            );
        } catch (Exception e) {
            // Loga o erro no console, mas não cancela a transação se o e-mail falhar (evita travar o sistema por oscilação de rede)
            System.err.println("Erro ao enviar e-mail de notificação: " + e.getMessage());
        }

        return salva; // Retorna a pendência salva

//        return pendenciaRepository.save(nova);
    }

    @Transactional
    public void realizarUpload(UUID id, String url) {
        Pendencia p = pendenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pendência não encontrada"));

        p.setArquivoUrl(url);
        p.setStatus(StatusPendencia.EM_ANALISE); // Sugestão: muda para análise após upload
        pendenciaRepository.save(p);
    }

    @Transactional
    public void alterarStatus(UUID id, StatusPendencia status) {
        Pendencia p = pendenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pendência não encontrada"));
        p.setStatus(status);
        pendenciaRepository.save(p);
    }
}
