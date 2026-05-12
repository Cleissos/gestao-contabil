package com.PortalContabil.controller;

import com.PortalContabil.dto.LoginDTO;
import com.PortalContabil.dto.RegistroContadorDTO;
import com.PortalContabil.model.Contador;
import com.PortalContabil.model.User;
import com.PortalContabil.model.enums.UserRole;
import com.PortalContabil.repository.ClienteRepository;
import com.PortalContabil.repository.ContadorRepository;
import com.PortalContabil.repository.UserRepository;
import com.PortalContabil.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private ContadorRepository contadorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody @Valid LoginDTO data) {
        var response = authService.login(data);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/register/contador")
    @Transactional
    public ResponseEntity registerContador(@RequestBody @Valid RegistroContadorDTO data) {

        if (this.userRepository.findByLogin(data.login()).isPresent()) {
            return ResponseEntity.badRequest().body("Erro: Usuário já cadastrado");
        }

        try {
            String encryptedPassword = new BCryptPasswordEncoder().encode(data.password());

            // 1. Criar e salvar a conta de ACESSO (User)
            User newUser = new User();
            newUser.setLogin(data.login());
            newUser.setPassword(encryptedPassword);
            newUser.setRole(UserRole.CONTADOR);

            // Ao salvar aqui, o ID UUID é gerado
            User userSalvo = this.userRepository.save(newUser);

            // 2. Criar e salvar o PERFIL PROFISSIONAL (Contador)
            Contador novoContador = new Contador();
            novoContador.setNome(data.nome());
            novoContador.setRegistroProfissional(data.registroProfissional());

            // O MapsId fará com que o ID do novoContador seja o ID do userSalvo
            novoContador.setUserAccount(userSalvo);

            this.contadorRepository.save(novoContador);

            return ResponseEntity.ok("Contador registrado com sucesso");

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro ao registrar: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMeuPerfil(@AuthenticationPrincipal User userLogado) {
        if (userLogado.getRole() == UserRole.CONTADOR) {
            return contadorRepository.findById(userLogado.getId())
                    .map(c -> ResponseEntity.ok(java.util.Map.of("nome", c.getNome(), "role", "CONTADOR")))
                    .orElse(ResponseEntity.notFound().build());
        } else {
            return clienteRepository.findById(userLogado.getId())
                    .map(c -> ResponseEntity.ok(java.util.Map.of("nome", c.getNome(), "role", "CLIENTE")))
                    .orElse(ResponseEntity.notFound().build());
        }
    }

}
