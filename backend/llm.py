from llama_cpp import Llama
import threading

# Load model once
llm = Llama(
    model_path="models/qwen2.5-7b-instruct-q4_k_m-00001-of-00002.gguf",
    n_ctx=2048,
    n_threads=10,
    n_gpu_layers=0,
    verbose=True
)

# Global lock for LLM access
LOCK = threading.Lock()

def run_local_llm(prompt: str) -> str:
    try:
        # ⭐ USE create_completion — safe for your version
        # Protect with lock to avoid access violation
        with LOCK:
            response = llm(
                prompt=prompt,
                max_tokens=150,
                stop=[
                    "Human:", "User:", "Assistant:", "assistant:",
                    "\nHuman:", "\nUser:", "</s>"
                ] 
           )

        text = response["choices"][0]["text"].strip()

        # HARD TRIM — remove anything after Human:/Assistant:
        for bad in ["Human:", "User:", "Assistant:", "assistant:"]:
            if bad in text:
                text = text.split(bad)[0].strip()

        return text

    except Exception as e:
        print("LLM ERROR:", e)
        return ""