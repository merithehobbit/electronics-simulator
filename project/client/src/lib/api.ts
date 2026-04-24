const BASE_URL = "http://localhost:3000/api";

export async function getCircuits() {
  const res = await fetch(`${BASE_URL}/circuits`);
  return res.json();
}

export async function createCircuit(data: any) {
  const res = await fetch(`${BASE_URL}/circuits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
