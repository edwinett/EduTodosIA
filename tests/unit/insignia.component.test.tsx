import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Insignia } from "@/components/gamificacion/Insignia";
import { INSIGNIAS } from "@/data/insignias";

describe("<Insignia />", () => {
  it("muestra el nombre y marca el estado de obtención", () => {
    const def = INSIGNIAS[0]!;
    render(<Insignia insignia={def} obtenida />);
    expect(screen.getByText(def.nombre)).toBeInTheDocument();
    expect(
      screen.getByLabelText(new RegExp(`${def.nombre}.*obtenida`, "i")),
    ).toBeInTheDocument();
  });

  it("marca como bloqueada cuando no está obtenida", () => {
    const def = INSIGNIAS[1]!;
    render(<Insignia insignia={def} obtenida={false} />);
    expect(
      screen.getByLabelText(new RegExp(`${def.nombre}.*bloqueada`, "i")),
    ).toBeInTheDocument();
  });
});
