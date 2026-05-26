package com.PortalContabil.dto;

import com.PortalContabil.model.enums.TipoCliente;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// ClienteCreateDTO (Para o contador cadastrar um novo cliente)
public record ClienteCreateDTO(
        @NotBlank String nome,
        @NotBlank String cpfCnpj,
        @NotBlank String password,
        @NotBlank @Email String email, // 💡 ADICIONADO: Campo obrigatório e validado
        @NotNull TipoCliente tipoCliente
) {
}
