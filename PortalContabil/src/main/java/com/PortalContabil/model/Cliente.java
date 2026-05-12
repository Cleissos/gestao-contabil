package com.PortalContabil.model;

import com.PortalContabil.model.enums.TipoCliente;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "clients")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Cliente {

    @Id
    @JdbcTypeCode(SqlTypes.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nome;
    @Column(nullable = false)
    private String cpfCnpj;

    @Enumerated(EnumType.STRING)
    private TipoCliente  tipoCliente; // PF ou MEI

    @ManyToOne
    @JoinColumn(name = "contador_id", columnDefinition = "uuid")
    private Contador contador; // Agora aponta para perfil do Contador

    @OneToOne
    @MapsId // O ID do cliente será o mesmo ID do usuário dele
    @JoinColumn(name = "user_id", columnDefinition = "uuid")
    private User userAccount;
}
