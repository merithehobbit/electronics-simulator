import { useState } from "react";

type ComponentType = "resistor" | "led";

type Component = {
  id: number;
  type: ComponentType;
  x: number;
  y: number;
  resistance?: number;
  forwardVoltage?: number;
};

type Wire = {
  id: number;
  from: number;
  to: number;
  path: { x: number; y: number }[];
};

const GRID = 20;

export default function Lab() {
  const [voltage, setVoltage] = useState(10);

  const [components, setComponents] = useState<Component[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);

  const [mode, setMode] = useState<"wire" | "delete">("wire");
  const [wireStart, setWireStart] = useState<number | null>(null);
  const [tempWire, setTempWire] = useState<{ x: number; y: number } | null>(null);

  const snap = (v: number) => Math.round(v / GRID) * GRID;

  const addResistor = () => {
    setComponents((p) => [
      ...p,
      { id: Date.now(), type: "resistor", x: 120, y: 120, resistance: 100 },
    ]);
  };

  const addLED = () => {
    setComponents((p) => [
      ...p,
      { id: Date.now(), type: "led", x: 200, y: 120, forwardVoltage: 2 },
    ]);
  };

  const deleteComponent = (id: number) => {
    setComponents((p) => p.filter((c) => c.id !== id));
    setWires((p) => p.filter((w) => w.from !== id && w.to !== id));
  };

  const deleteWire = (id: number) => {
    setWires((p) => p.filter((w) => w.id !== id));
  };

  const updateComponent = (id: number, key: string, value: number) => {
    setComponents((p) =>
      p.map((c) => (c.id === id ? { ...c, [key]: value } : c))
    );
  };

  const moveComponent = (id: number, x: number, y: number) => {
    setComponents((p) =>
      p.map((c) =>
        c.id === id ? { ...c, x: snap(x), y: snap(y) } : c
      )
    );
  };

  // -----------------------
  // WIRE SYSTEM (snap + drag)
  // -----------------------

  const center = (c: Component) => ({
    x: c.x + 20,
    y: c.y + 20,
  });

  const startWire = (id: number) => {
    if (mode !== "wire") return;
    setWireStart(id);
  };

  const finishWire = (id: number) => {
    if (mode !== "wire") return;
    if (wireStart === null || wireStart === id) return;

    const a = components.find((c) => c.id === wireStart);
    const b = components.find((c) => c.id === id);

    if (!a || !b) return;

    const ca = center(a);
    const cb = center(b);

    setWires((p) => [
      ...p,
      {
        id: Date.now(),
        from: wireStart,
        to: id,
        path: [
          ca,
          { x: (ca.x + cb.x) / 2, y: ca.y - 40 },
          cb,
        ],
      },
    ]);

    setWireStart(null);
    setTempWire(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (wireStart === null) return;
    setTempWire({ x: e.clientX, y: e.clientY });
  };

  // -----------------------
  // CIRCUIT MATH (unchanged)
  // -----------------------

  const resistors = components.filter((c) => c.type === "resistor");

  const connectedTo = (id: number) =>
    wires
      .filter((w) => w.from === id || w.to === id)
      .map((w) => (w.from === id ? w.to : w.from));

  const visited = new Set<number>();
  const branches: number[][] = [];

  const dfs = (start: number, group: number[]) => {
    visited.add(start);
    group.push(start);

    for (const n of connectedTo(start)) {
      if (!visited.has(n)) dfs(n, group);
    }
  };

  for (const c of resistors) {
    if (!visited.has(c.id)) {
      const group: number[] = [];
      dfs(c.id, group);
      branches.push(group);
    }
  }

  const branchResistances = branches.map((b) =>
    b
      .map((id) => components.find((c) => c.id === id))
      .filter((c): c is Component => !!c)
      .reduce((sum, c) => sum + (c.resistance || 0), 0)
  );

  const totalResistance =
    branchResistances.length > 0
      ? 1 / branchResistances.reduce((s, r) => s + 1 / r, 0)
      : 0;

  const current = totalResistance > 0 ? voltage / totalResistance : 0;

  // simple current animation
  const flowDots = Array.from({ length: 6 });

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>⚡ Electronics Sandbox</h1>

      {/* TOOLBAR */}
      <div style={{ marginBottom: 10 }}>
        <input
          type="number"
          value={voltage}
          onChange={(e) => setVoltage(Number(e.target.value))}
          style={{ width: 70 }}
        />

        <button onClick={addResistor}>Resistor</button>
        <button onClick={addLED}>LED</button>

        <button
          onClick={() => setMode("wire")}
          style={{ marginLeft: 10 }}
        >
          Wire Mode
        </button>

        <button
          onClick={() => setMode("delete")}
          style={{ marginLeft: 10 }}
        >
          Delete Mode
        </button>
      </div>

      <div>
        <b>Current:</b> {current.toFixed(3)}A
      </div>

      {/* CANVAS */}
      <div
        onMouseMove={handleMouseMove}
        style={{
          width: "100%",
          height: 500,
          border: "2px solid #333",
          position: "relative",
          backgroundImage:
            "linear-gradient(#eee 1px, transparent 1px), linear-gradient(90deg, #eee 1px, transparent 1px)",
          backgroundSize: `${GRID}px ${GRID}px`,
        }}
      >
        {/* WIRES */}
        <svg style={{ position: "absolute", width: "100%", height: "100%" }}>
          {wires.map((w) => (
            <polyline
              key={w.id}
              points={w.path.map((p) => `${p.x},${p.y}`).join(" ")}
              stroke="black"
              fill="none"
              onClick={() => mode === "delete" && deleteWire(w.id)}
              style={{ cursor: "pointer" }}
            />
          ))}

          {/* preview wire */}
          {wireStart && tempWire && (
            <line
              x1={center(components.find((c) => c.id === wireStart)!).x}
              y1={center(components.find((c) => c.id === wireStart)!).y}
              x2={tempWire.x}
              y2={tempWire.y}
              stroke="gray"
              strokeDasharray="5,5"
            />
          )}

          {/* CURRENT FLOW (simple dots) */}
          {mode !== "delete" &&
            wires.map((w) =>
              flowDots.map((_, i) => (
                <circle
                  key={`${w.id}-${i}`}
                  r={3}
                  fill="orange"
                  opacity={0.8}
                >
                  <animateMotion dur="2s" repeatCount="indefinite">
                    <mpath
                      href={`#path-${w.id}`}
                    />
                  </animateMotion>
                </circle>
              ))
            )}
        </svg>

        {/* hidden paths for animation */}
        <svg width="0" height="0">
          {wires.map((w) => (
            <path
              key={w.id}
              id={`path-${w.id}`}
              d={`M ${w.path.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
            />
          ))}
        </svg>

        {/* COMPONENTS */}
        {components.map((c) => {
          const isLEDOn =
            c.type === "led" &&
            totalResistance > 0 &&
            voltage / totalResistance >= (c.forwardVoltage || 2);

          let voltageDrop =
            c.type === "resistor"
              ? totalResistance > 0
                ? (voltage * (c.resistance || 0)) / totalResistance
                : 0
              : 0;

          return (
            <div
              key={c.id}
              onMouseDown={(e) => {
                if (mode === "delete") {
                  deleteComponent(c.id);
                  return;
                }

                startWire(c.id);

                const startX = e.clientX;
                const startY = e.clientY;

                const onMove = (ev: MouseEvent) => {
                  moveComponent(
                    c.id,
                    c.x + (ev.clientX - startX),
                    c.y + (ev.clientY - startY)
                  );
                };

                const onUp = () => {
                  window.removeEventListener("mousemove", onMove);
                  window.removeEventListener("mouseup", onUp);
                };

                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
              }}
              onMouseUp={() => finishWire(c.id)}
              style={{
                position: "absolute",
                left: c.x,
                top: c.y,
                width: 70,
                padding: 6,
                border: "1px solid #444",
                borderRadius: 6,
                textAlign: "center",
                background: c.type === "led" && isLEDOn ? "#fff7a8" : "#fff",
                cursor: "grab",
                userSelect: "none",
              }}
            >
              {c.type === "resistor" && (
                <>
                  <div>🔌</div>
                  <input
                    type="number"
                    value={c.resistance}
                    onChange={(e) =>
                      updateComponent(c.id, "resistance", Number(e.target.value))
                    }
                    style={{ width: 55 }}
                  />
                  <div>{voltageDrop.toFixed(2)}V</div>
                </>
              )}

              {c.type === "led" && (
                <>
                  <div
                    style={{
                      filter: isLEDOn
                        ? "drop-shadow(0 0 10px gold)"
                        : "grayscale(1)",
                    }}
                  >
                    💡
                  </div>
                  <div>{isLEDOn ? "ON" : "OFF"}</div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}