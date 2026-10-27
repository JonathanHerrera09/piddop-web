import { describe, expect, it } from "vitest";
import { loginErrorMessage } from "@/lib/login-error";
import { ApiError } from "@/services/http";

describe("loginErrorMessage", () => {
  it("traduce credenciales inválidas sin exponer detalles", () => {
    expect(loginErrorMessage(new ApiError("Invalid email or password", 401))).toBe(
      "El correo o la contraseña no son correctos.",
    );
  });

  it("traduce los errores de cuenta inactiva y límite de intentos", () => {
    expect(loginErrorMessage(new ApiError("This user is not active", 403))).toBe(
      "Esta cuenta no está activa. Comunícate con soporte.",
    );
    expect(
      loginErrorMessage(
        new ApiError("Too many authentication attempts. Please try again later.", 429),
      ),
    ).toBe("Has realizado demasiados intentos. Espera unos minutos e inténtalo de nuevo.");
  });

  it("conserva mensajes de API que ya están en español", () => {
    expect(
      loginErrorMessage(
        new ApiError("Tu cuenta no tiene empresas asignadas para operar en la web.", 403),
      ),
    ).toBe("Tu cuenta no tiene empresas asignadas para operar en la web.");
  });
});
