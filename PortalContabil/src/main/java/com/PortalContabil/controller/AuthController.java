package com.PortalContabil.controller;

import com.PortalContabil.dto.EsqueciSenhaDTO;
import com.PortalContabil.dto.LoginDTO;
import com.PortalContabil.dto.RedefinirSenhaDTO;
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
            newUser.setNome(data.nome());
            newUser.setLogin(data.login());
            newUser.setPassword(encryptedPassword);
            newUser.setRole(UserRole.CONTADOR);
            newUser.setEmail(data.email()); //  ADICIONADO: Salvando o e-mail no banco de dados

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
//                    .map(c -> ResponseEntity.ok(java.util.Map.of("nome", c.getNome(), "role", "CLIENTE", "contadorId", c.getId())))
                    .map(c -> ResponseEntity.ok(java.util.Map.of(
                            "nome", c.getNome(),
                            "role", "CLIENTE",
                            "contadorId", c.getContador().getUserAccount().getId() // Busca o ID de acesso do contador
                    )))
                    .orElse(ResponseEntity.notFound().build());
        }
    }

    // --- NOVO: ENDPOINT PARA SOLICITAR O LINK DE RECUPERAÇÃO ---
    @PostMapping("/esqueci-senha")
    public ResponseEntity<?> esqueciSenha(@RequestBody @Valid EsqueciSenhaDTO data) {
        try {
            authService.solicitarRecuperacaoSenha(data.email());
            return ResponseEntity.ok(java.util.Map.of("mensagem", "Link de recuperação enviado com sucesso para o seu e-mail!"));
        } catch (RuntimeException e) {
            // Retorna um erro amigável caso o e-mail não exista
            return ResponseEntity.badRequest().body(java.util.Map.of("erro", e.getMessage()));
        }
    }

    // --- NOVO: ENDPOINT PARA SALVAR A NOVA SENHA ---
    @PostMapping("/redefinir-senha")
    public ResponseEntity<?> redefinirSenha(@RequestBody @Valid RedefinirSenhaDTO data) {
        try {
            authService.redefinirSenha(data.token(), data.novaSenha());
            return ResponseEntity.ok(java.util.Map.of("mensagem", "Senha alterada com sucesso!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("erro", e.getMessage()));
        }
    }

}
