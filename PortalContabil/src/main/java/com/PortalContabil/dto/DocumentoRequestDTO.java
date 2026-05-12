package com.PortalContabil.dto;

import com.PortalContabil.model.enums.TipoDocumento;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// Estes servem para organizar o envio de arquivos e a listagem por mês/ano.
//DocumentoRequestDTO: Para o cliente enviar um novo arquivo.
public record DocumentoRequestDTO(
        @NotNull TipoDocumento tipo,
        @Min(1) @Max(12) Integer mes,
        @NotNull Integer ano,
        @NotBlank String urlArquivo // Link gerado após o upload
        ) {
}
