from llama_cpp import Llama

# Load your Qwen 2.5 7B Instruct model
# IMPORTANT: only load "…00001-of-00002.gguf"
# The second shard is auto-loaded by llama.cpp
LLM_PATH = "models/qwen2.5-7b-instruct-q4_k_m-00001-of-00002.gguf"

# Load at startup
llm = Llama(
    model_path=LLM_PATH,
    n_ctx=2048,
    n_threads=10,   # adjust to your CPU
    n_gpu_layers=1 # if CPU only. If GPU, set like 20-40
)

def run_local_llm(prompt: str) -> str:
    out = model.generate(prompt, max_tokens=180)

    # Convert to string
    text = str(out)

    # Strip "Assistant:" prefix or any prompt reflection
    if "Assistant:" in text:
        text = text.split("Assistant:", 1)[1].strip()

    # Stop at "Human:" or anything that looks like next turn
    for stop_word in ["Human:", "User:", "Your task:", "\n\nHuman"]:
        if stop_word in text:
            text = text.split(stop_word)[0].strip()

    return text