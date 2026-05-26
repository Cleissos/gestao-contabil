package com.PortalContabil.controller;

import com.PortalContabil.dto.PendenciaDTO;
import com.PortalContabil.model.Cliente;
import com.PortalContabil.model.Pendencia;
import com.PortalContabil.model.User;
import com.PortalContabil.model.enums.StatusPendencia;
import com.PortalContabil.repository.ClienteRepository;
import com.PortalContabil.repository.PendenciaRepository;
import com.PortalContabil.service.FileStorageService;
import com.PortalContabil.service.PendenciaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

//@RestController
//@RequestMapping("/pendencias")
//public class PendenciaController {
//
//    @Autowired
//    private PendenciaService pendenciaService;
//
//    @Autowired
//    private PendenciaRepository pendenciaRepository;
//
//    @Autowired
//    private ClienteRepository clienteRepository;
//
//    @Autowired
//    private FileStorageService fileStorageService;
//
//    // MÓDULO DO CONTADOR: Cria uma tarefa para o cliente
//    @PostMapping
//    @PreAuthorize("hasRole('CONTADOR')")
//    public ResponseEntity<Pendencia> criar(@RequestBody @Valid PendenciaDTO data) {
//        Pendencia nova = pendenciaService.criarPendencia(data);
//        return ResponseEntity.ok(nova);
//    }
//
//    // MÓDULO DO CLIENTE: Visualiza apenas o que pertence a ele
//    @GetMapping("/minhas")
//    @PreAuthorize("hasRole('CLIENTE')")
//    public ResponseEntity<List<Pendencia>> listarParaCliente(@AuthenticationPrincipal User userAccount) {
//        // Buscamos o perfil de Cliente associado à conta de login (userAccount)
//        Cliente cliente = clienteRepository.findByUserAccount(userAccount)
//                .orElseThrow(() -> new RuntimeException("Perfil de cliente não encontrado"));
//
//        List<Pendencia> pendencias = pendenciaRepository.findByCliente(cliente);
//        return ResponseEntity.ok(pendencias);
//    }
//
//    // CLIENTE OU CONTADOR: Upload de arquivo real para uma pendência específica
//    @PostMapping("/{id}/upload")
//    @PreAuthorize("hasRole('CLIENTE')")
//    public ResponseEntity<String> upload(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
//        // 1. Salva o arquivo fisicamente na pasta /uploads
//        String nomeArquivoGerado = fileStorageService.salvar(file);
//
//        // 2. Atualiza o banco de dados com o nome do arquivo e muda o status
//        pendenciaService.realizarUpload(id, nomeArquivoGerado);
//
//        return ResponseEntity.ok("Arquivo " + file.getOriginalFilename() + " enviado e salvo com sucesso!");
//    }
//
//    // AMBOS: Endpoint para baixar o arquivo
//    @GetMapping("/download/{filename:.+}")
//    public ResponseEntity<Resource> download(@PathVariable String filename) {
//        Resource file = fileStorageService.carregar(filename);
//
//        return ResponseEntity.ok()
//                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
//                .body(file);
//    }
//
//    // AMBOS: Atualizar status (Ex: Contador coloca como CONCLUÍDO após conferir)
//    @PatchMapping("/{id}/status")
//    public ResponseEntity<Void> atualizarStatus(@PathVariable UUID id, @RequestParam StatusPendencia status) {
//        pendenciaService.alterarStatus(id, status);
//        return ResponseEntity.ok().build();
//    }
//}

@RestController
@RequestMapping("/pendencias")
public class PendenciaController {

    @Autowired
    private PendenciaService pendenciaService;

    @Autowired
    private PendenciaRepository pendenciaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private FileStorageService fileStorageService;

    // MÓDULO DO CONTADOR: Cria uma tarefa para o cliente
    @PostMapping
    @PreAuthorize("hasRole('CONTADOR')")
    public ResponseEntity<Pendencia> criar(@RequestBody @Valid PendenciaDTO data) {
        Pendencia nova = pendenciaService.criarPendencia(data);
        return ResponseEntity.ok(nova);
    }

    // 💡 NOVO ENDPOINT: Buscas as pendências de um cliente específico (Usado no filtro do Contador)
    @GetMapping("/cliente/{clienteId}")
    @PreAuthorize("hasRole('CONTADOR')")
    public ResponseEntity<List<Pendencia>> listarPorCliente(@PathVariable UUID clienteId) {
        // Busca o cliente pelo ID vindo do parâmetro da URL
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        List<Pendencia> pendencias = pendenciaRepository.findByCliente(cliente);
        return ResponseEntity.ok(pendencias);
    }

    // MÓDULO DO CLIENTE: Visualiza apenas o que pertence a ele
    @GetMapping("/minhas")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<List<Pendencia>> listarParaCliente(@AuthenticationPrincipal User userAccount) {
        Cliente cliente = clienteRepository.findByUserAccount(userAccount)
                .orElseThrow(() -> new RuntimeException("Perfil de cliente não encontrado"));

        List<Pendencia> pendencias = pendenciaRepository.findByCliente(cliente);
        return ResponseEntity.ok(pendencias);
    }

    // CLIENTE: Upload de arquivo real para uma pendência específica
    @PostMapping("/{id}/upload")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<String> upload(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        // 1. Salva o arquivo fisicamente na pasta /uploads
        String nomeArquivoGerado = fileStorageService.salvar(file);

        // 2. Atualiza o banco de dados com o nome do arquivo e muda o status para EM_ANALISE
        pendenciaService.realizarUpload(id, nomeArquivoGerado);

        return ResponseEntity.ok("Arquivo " + file.getOriginalFilename() + " enviado e salvo com sucesso!");
    }

    // AMBOS: Endpoint para baixar o arquivo
    @GetMapping("/download/{filename:.+}")
    public ResponseEntity<Resource> download(@PathVariable String filename) {
        Resource file = fileStorageService.carregar(filename);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }

    // CONTADOR: Atualizar status (Ex: Contador coloca como CONCLUÍDO após conferir)
    // 💡 Adicionado PreAuthorize para garantir que apenas o CONTADOR dê baixa final nas pendências
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('CONTADOR')")
    public ResponseEntity<Void> atualizarStatus(@PathVariable UUID id, @RequestParam StatusPendencia status) {
        pendenciaService.alterarStatus(id, status);
        return ResponseEntity.ok().build();
    }
}
