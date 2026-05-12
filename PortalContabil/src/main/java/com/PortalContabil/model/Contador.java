package com.PortalContabil.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "contadores")
@Getter @Setter
public class Contador {

    @Id
    @JdbcTypeCode(SqlTypes.UUID) // Adicione isso aqui também
    private UUID id;

    private String nome;
    private String registroProfissional; // O CRC que você precisava

    @OneToOne
    @MapsId // ESSA É A CHAVE: Diz que o ID desta classe é o ID da userAccount
    @JoinColumn(name = "user_id", columnDefinition = "uuid") // FK para a tabela users
    private User userAccount;
}
