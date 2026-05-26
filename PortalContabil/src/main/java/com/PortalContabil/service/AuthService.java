package com.PortalContabil.service;

import com.PortalContabil.dto.LoginDTO;
import com.PortalContabil.dto.UserResponseDTO;
import com.PortalContabil.model.User;
import com.PortalContabil.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenService tokenService;

    // Nota: O AuthenticationManager será configurado no SecurityConfig logo abaixo
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private EmailService emailService; // Injetando o serviço de e-mail do Gmail

    public UserResponseDTO login(LoginDTO data) {
        // 1. O Spring tenta autenticar o login e a senha
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.login(), data.password());
        var auth = this.authenticationManager.authenticate(usernamePassword);

        // 2. Se deu certo, pegamos o usuário autenticado
        var user = (com.PortalContabil.model.User) auth.getPrincipal();

        // 3. Geramos o Token JWT para este usuário
        var token = tokenService.generateToken(user);

        // 4. Devolvemos os dados para o Controller
        return new UserResponseDTO(user.getId(), user.getLogin(), user.getRole(), token);
    }

    // --- NOVO: SOLICITAR RECUPERAÇÃO DE SENHA ---
    public void solicitarRecuperacaoSenha(String email) {
        // 1. Busca o usuário pelo e-mail
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com este e-mail."));

        // 2. Gera um token único e temporário
        String token = UUID.randomUUID().toString();
        user.setTokenRecuperacao(token);
        user.setExpiracaoToken(LocalDateTime.now().plusMinutes(15)); // Válido por 15 minutos

        // 3. Salva os dados do token no usuário
        userRepository.save(user);

        // 4. Monta o link que aponta para o seu Frontend React (Porta 5173 do Vite ou 3000)
        // Quando estiver hospedado, você mudará esse "localhost" para o link oficial do site
        String linkRecuperacao = "http://localhost:5173/redefinir-senha?token=" + token;

        // 5. Dispara o e-mail usando a Senha de App do Gmail
        emailService.enviarEmailRecuperacao(user.getEmail(), linkRecuperacao);
    }

    // --- NOVO: REDEFINIR A SENHA DE FATO ---
    public void redefinirSenha(String token, String novaSenha) {
        // 1. Valida se o token existe no banco
        User user = userRepository.findByTokenRecuperacao(token)
                .orElseThrow(() -> new RuntimeException("Token de recuperação inválido ou inexistente."));

        // 2. Valida se o token não expirou
        if (user.getExpiracaoToken().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("O link de recuperação expirou. Solicite um novo.");
        }

        // 3. Criptografa a nova senha com Bcrypt
        user.setPassword(passwordEncoder.encode(novaSenha));

        // 4. Limpa o token para que ele nunca mais possa ser reutilizado
        user.setTokenRecuperacao(null);
        user.setExpiracaoToken(null);

        // 5. Salva o usuário com a nova senha
        userRepository.save(user);
    }
}
