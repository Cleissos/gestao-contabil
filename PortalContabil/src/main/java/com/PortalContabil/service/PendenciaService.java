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

//    @Autowired
//    private PendenciaRepository pendenciaRepository;
//
//    @Autowired
//    private ClienteRepository clienteRepository;
//
//    public Pendencia criarPendencia(PendenciaDTO data) {
//        Cliente cliente = clienteRepository.findById(data.clienteId())
//                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
//
//        Pendencia nova = new Pendencia();
//        nova.setDescricao(data.descricao());
//        nova.setPrazo(data.prazo());
//        nova.setStatus(StatusPendencia.ABERTO); // Toda pendência nasce aberta
//        nova.setCliente(cliente);
//
//        return pendenciaRepository.save(nova);
//    }
//
//    public void alterarStatus(UUID id, StatusPendencia status) {
//        Pendencia p = pendenciaRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Pendência não encontrada"));
//        p.setStatus(status);
//        pendenciaRepository.save(p);
//    }

    @Autowired
    private PendenciaRepository pendenciaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

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

        return pendenciaRepository.save(nova);
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
