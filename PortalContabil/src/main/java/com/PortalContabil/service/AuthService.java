package com.PortalContabil.service;

import com.PortalContabil.dto.LoginDTO;
import com.PortalContabil.dto.UserResponseDTO;
import com.PortalContabil.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
}
