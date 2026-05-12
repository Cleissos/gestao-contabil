package com.PortalContabil.model;

import com.PortalContabil.model.enums.StatusPendencia;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "tasks")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Pendencia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.UUID)
    private UUID id;

    private String descricao;
    private LocalDate prazo;

    @Enumerated(EnumType.STRING)
    private StatusPendencia status; // ABERTO, EM_ANALISE, CONCLUIDO

    private LocalDate dataVencimento;

    // A pendência pertence a um cliente
    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    // Caminho do arquivo (caso o cliente envie um documento)
    private String arquivoUrl;
}
