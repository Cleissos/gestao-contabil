package com.PortalContabil.controller;

import com.PortalContabil.dto.ClienteCreateDTO;
import com.PortalContabil.dto.ClienteResponseDTO;
import com.PortalContabil.model.Cliente;
import com.PortalContabil.model.Contador;
import com.PortalContabil.model.User;
import com.PortalContabil.repository.ClienteRepository;
import com.PortalContabil.repository.ContadorRepository;
import com.PortalContabil.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/clientes")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ContadorRepository contadorRepository;

    @PostMapping
    @PreAuthorize("hasRole('CONTADOR')")
    public ResponseEntity cadastrar(@RequestBody @Valid ClienteCreateDTO data, @AuthenticationPrincipal User userLogado) {
        // O Service cuidará de achar o perfil do contador baseado no User logado
        clienteService.cadastrarNovoCliente(data, userLogado);
        return ResponseEntity.ok("Cliente cadastrado com sucesso!");
    }

    @GetMapping
    @PreAuthorize("hasRole('CONTADOR')")
    public ResponseEntity<List<ClienteResponseDTO>> listarMeusClientes(@AuthenticationPrincipal User userLogado) {
        // 1. Localiza o perfil de Contador vinculado ao usuário autenticado
        Contador contador = contadorRepository.findByUserAccount(userLogado)
                .orElseThrow(() -> new RuntimeException("Perfil de contador não encontrado"));

        // 2. Busca os clientes do contador
        List<Cliente> clientes = clienteRepository.findByContador(contador);

        // 3. Mapeia a Entidade para o DTO
        List<ClienteResponseDTO> response = clientes.stream().map(cliente -> new ClienteResponseDTO(
                cliente.getId(),
                cliente.getNome(),
                cliente.getCpfCnpj(),
                cliente.getTipoCliente().name(), // Assume que Tipo é um Enum (PF/PJ)
                cliente.getUserAccount().getLogin(), // Login de acesso do cliente
                cliente.getUserAccount().getEmail()  //  CORRIGIDO: Agora retorna o e-mail real salvo no banco!
        )).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
