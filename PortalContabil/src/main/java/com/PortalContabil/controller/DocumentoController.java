package com.PortalContabil.controller;

import com.PortalContabil.dto.DocumentoHistoricoDTO;
import com.PortalContabil.dto.DocumentoRequestDTO;
import com.PortalContabil.dto.DocumentoResponseDTO;
import com.PortalContabil.model.Cliente;
import com.PortalContabil.model.Contador;
import com.PortalContabil.model.Documento;
import com.PortalContabil.model.User;
import com.PortalContabil.model.enums.TipoDocumento;
import com.PortalContabil.repository.ClienteRepository;
import com.PortalContabil.repository.ContadorRepository;
import com.PortalContabil.repository.DocumentoRepository;
import com.PortalContabil.service.DocumentoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/documentos")
public class DocumentoController {

    @Autowired
    private DocumentoRepository documentoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private DocumentoService documentoService;

    @Autowired
    private ContadorRepository contadorRepository;

    // CLIENTE: Enviar um novo documento (após o upload físico)
    @PostMapping
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<DocumentoResponseDTO> salvar(@RequestBody @Valid DocumentoRequestDTO data, @AuthenticationPrincipal User userLogado) {
        Cliente cliente = clienteRepository.findByUserAccount(userLogado)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        // Chama o service simplificado
        Documento salvo = documentoService.salvarDocumento(data,cliente);
        return ResponseEntity.ok(mapToResponseDTO(salvo));
    }

    // CONTADOR: Listar documentos de um cliente específico com filtros
    @GetMapping("/cliente/{clienteId}")
    @PreAuthorize("hasRole('CONTADOR')")
    public ResponseEntity<List<DocumentoResponseDTO>> listarPorCliente(
            @PathVariable UUID clienteId,
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) Integer ano) {

        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        List<Documento> docs;
        if (mes != null && ano != null) {
            docs = documentoRepository.findByClienteAndMesAndAno(cliente, mes, ano);
        } else {
            docs = documentoRepository.findByCliente(cliente);
        }

        return ResponseEntity.ok(docs.stream().map(this::mapToResponseDTO).collect(Collectors.toList()));
    }

    // CLIENTE: Ver seus próprios documentos
    @GetMapping("/meus")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<List<DocumentoResponseDTO>> listarMeusDocumentos(@AuthenticationPrincipal User userLogado) {

        Optional<Cliente> clienteOpt = clienteRepository.findByUserAccount(userLogado);

        if (clienteOpt.isEmpty()) {
            // Retorna uma lista vazia e status 200 em vez de estourar um erro 500
            return ResponseEntity.ok(Collections.emptyList());
        }

        Cliente cliente = clienteOpt.get();
        List<Documento> docs = documentoRepository.findByCliente(cliente);
        return ResponseEntity.ok(docs.stream().map(this::mapToResponseDTO).collect(Collectors.toList()));
    }

    // Helper para converter Entity em DTO
    private DocumentoResponseDTO mapToResponseDTO(Documento doc) {
        return new DocumentoResponseDTO(
                doc.getId(),
                doc.getTipo(),
                doc.getMes(),
                doc.getAno(),
                doc.getUrlArquivo(),
                doc.getDataUpload()
        );
    }

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('CONTADOR', 'CLIENTE')")
    public ResponseEntity<?> uploadArquivo(
            @RequestParam("file") MultipartFile file,
            @RequestParam("tipo") String tipo,
            @RequestParam(value = "clienteId", required = false) UUID clienteId,
            @AuthenticationPrincipal User userLogado) {

        try {
            String nomeArquivo = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path caminho = Paths.get("uploads").resolve(nomeArquivo);
            Files.copy(file.getInputStream(), caminho);

            Cliente clienteFinal;
            com.PortalContabil.model.Contador contadorResponsavel = null;
            String enviadoPor; // Variável auxiliar

            if (userLogado.getRole().name().equals("CLIENTE")) {
                clienteFinal = clienteRepository.findByUserAccount(userLogado)
                        .orElseThrow(() -> new RuntimeException("Perfil de cliente não encontrado"));
                contadorResponsavel = clienteFinal.getContador();
                enviadoPor = "CLIENTE"; // Identifica o remetente
            } else {
                if (clienteId == null) {
                    return ResponseEntity.badRequest().body("Erro: O ID do cliente é obrigatório.");
                }
                clienteFinal = clienteRepository.findById(clienteId)
                        .orElseThrow(() -> new RuntimeException("Cliente destino não encontrado"));

                contadorResponsavel = contadorRepository.findByUserAccount(userLogado)
                        .orElseThrow(() -> new RuntimeException("Perfil de contador não encontrado"));
                enviadoPor = "CONTADOR"; // Identifica o remetente
            }

            Documento novoDoc = new Documento();
            novoDoc.setTipo(TipoDocumento.valueOf(tipo));
            novoDoc.setUrlArquivo(nomeArquivo);
            novoDoc.setCliente(clienteFinal);
            novoDoc.setContador(contadorResponsavel);
            novoDoc.setDataUpload(LocalDateTime.now());
            novoDoc.setMes(LocalDate.now().getMonthValue());
            novoDoc.setAno(LocalDate.now().getYear());

            // --- NOVOS CAMPOS AQUI ---
            novoDoc.setEnviadoPor(enviadoPor);
            novoDoc.setAcao("UPLOAD");
            // -------------------------

            Documento salvo = documentoRepository.save(novoDoc);
            return ResponseEntity.ok(mapToResponseDTO(salvo));

        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar arquivo localmente", e);
        }
    }

    @GetMapping("/download/{id}")
    @PreAuthorize("hasAnyRole('CONTADOR', 'CLIENTE')")
    public ResponseEntity<org.springframework.core.io.Resource> download(@PathVariable UUID id) {
        try {
            Documento doc = documentoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Documento não encontrado"));

            Path caminho = Paths.get("uploads").resolve(doc.getUrlArquivo());
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(caminho.toUri());

            if (resource.exists() || resource.isReadable()) {
                // Tenta detectar o tipo de arquivo da forma mais robusta possível
                String contentType = Files.probeContentType(caminho);
                if (contentType == null) {
                    // Fallback manual baseado na extensão se o probe falhar
                    String nome = doc.getUrlArquivo().toLowerCase();
                    if (nome.endsWith(".pdf")) contentType = "application/pdf";
                    else if (nome.endsWith(".png")) contentType = "image/png";
                    else if (nome.endsWith(".jpg") || nome.endsWith(".jpeg")) contentType = "image/jpeg";
                    else contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                        // IMPORTANTE: inline instrui o browser a abrir, attachment instrui a baixar
                        .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getUrlArquivo() + "\"")
                        .header(org.springframework.http.HttpHeaders.CACHE_CONTROL, "no-cache")
                        .body(resource);
            } else {
                throw new RuntimeException("Arquivo não encontrado");
            }
        } catch (IOException e) {
            throw new RuntimeException("Erro ao processar arquivo", e);
        }
    }

    @GetMapping("/historico")
    @PreAuthorize("hasRole('CONTADOR')")
    public ResponseEntity<List<DocumentoHistoricoDTO>> listarHistorico(@AuthenticationPrincipal User userLogado) {
        Contador contador = contadorRepository.findByUserAccount(userLogado)
                .orElseThrow(() -> new RuntimeException("Contador não encontrado"));

        // Busca todos os documentos vinculados ao contador
        List<Documento> documentos = documentoRepository.findByContadorOrderByDataUploadDesc(contador);

        List<DocumentoHistoricoDTO> historico = documentos.stream().map(doc -> {
            String origem;
            String destino;

            // Lógica baseada no novo campo 'enviadoPor'
            if ("CONTADOR".equals(doc.getEnviadoPor())) {
                origem = contador.getNome(); // O contador enviou
                destino = doc.getCliente().getNome(); // Para o cliente
            } else {
                origem = doc.getCliente().getNome(); // O cliente enviou
                destino = contador.getNome(); // Para o contador
            }

            return new DocumentoHistoricoDTO(
                    doc.getId(),
                    doc.getTipo().name(),
                    doc.getDataUpload(),
                    doc.getAcao(), // Usa o campo 'acao' do banco (UPLOAD)
                    origem,
                    destino
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(historico);
    }

}
