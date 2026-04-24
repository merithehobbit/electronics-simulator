export type ComponentItem = {
  id: string;
  type: "battery" | "resistor" | "led" | "switch";
  x: number;
  y: number;
};

export type Circuit = {
  id: number;
  name: string;
  layout: ComponentItem[];
};
