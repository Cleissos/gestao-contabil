package com.PortalContabil.dto;

import jakarta.validation.constraints.NotBlank;

public record RegistroContadorDTO(
        @NotBlank String login,
        @NotBlank String password,
        @NotBlank String nome,
        @NotBlank String registroProfissional // O seu CRC [cite: 7]
) {
}
