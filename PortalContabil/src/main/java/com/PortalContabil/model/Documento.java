package com.PortalContabil.model;

import com.PortalContabil.model.enums.TipoDocumento;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "documents")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    private TipoDocumento tipo; // Nota, Extrato, etc.

    private Integer mes;
    private Integer ano;

    private String urlArquivo; // Link para a nuvem

    @Column(name = "data_upload", updatable = false)
    private LocalDateTime dataUpload =  LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    // ADICIONADO: Facilita a busca para o contador
    @ManyToOne
    @JoinColumn(name = "contador_id")
    private Contador contador;

    // Adicione este campo:
    private String enviadoPor; // "CONTADOR" ou "CLIENTE"

    // Se quiser ser ainda mais profissional, pode adicionar:
    private String acao; // "UPLOAD" ou "DOWNLOAD"

}
