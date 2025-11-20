export async function predict(text) {
  const response = await fetch("http://localhost:8000/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    console.error("Backend returned error:", await response.text());
    throw new Error("Backend error");
  }

  return response.json();
}