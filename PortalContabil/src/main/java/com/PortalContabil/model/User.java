package com.PortalContabil.model;

import com.PortalContabil.model.enums.StatusPendencia;
import com.PortalContabil.model.enums.UserRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter @Setter
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nome; // Adicione este campo para salvar o Nome ou Razão Social

    @Column(nullable = false, unique = true)
    private String login; // CPF, CNPJ ou CRC

    // --- NOVOS CAMPOS PARA RECUPERAÇÃO DE SENHA ---
    @Column(nullable = false, unique = true)
    private String email; // O e-mail onde o usuário vai receber o link

    private String tokenRecuperacao; // Guarda o token temporário gerado

    private LocalDateTime expiracaoToken; // Guarda a data/hora limite para usar o token
    // ----------------------------------------------

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role; // CONTADOR ou CLIENTE

    // MÉTODOS DO USERDETAILS (Obrigatórios para a segurança funcionar)

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Define as permissões baseadas na Role
        if (this.role == UserRole.CONTADOR) {
            return List.of(new SimpleGrantedAuthority("ROLE_CONTADOR"), new SimpleGrantedAuthority("ROLE_CLIENTE"));
        }

        return List.of(new SimpleGrantedAuthority("ROLE_CLIENTE"));

    }

    @Override
    public String getUsername() {
        return login;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Conta não expira
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Conta não bloqueia
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Senha não expira
    }

    @Override
    public boolean isEnabled() {
        return true; // Usuário está ativo
    }

}
