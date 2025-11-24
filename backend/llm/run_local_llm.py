from llama_cpp import Llama

LLM_PATH = "models/qwen2.5-7b-instruct-q4_k_m-00001-of-00002.gguf"

llm = Llama(
    model_path=LLM_PATH,
    n_ctx=2048,
    n_threads=8,
    n_gpu_layers=0,
    verbose=False
)

def run_local_llm(prompt: str) -> str:
    try:
        out = llm(
            prompt=prompt,
            max_tokens=200,
            temperature=0.4,
            top_p=0.9,
            stop=["User:", "Human:", "</s>"]
        )

        # RAW RESPONSE IS ALWAYS A DICT → USE choices[0].text
        text = out["choices"][0]["text"].strip()

        # Remove "Assistant:" if model echos
        if text.lower().startswith("assistant:"):
            text = text[len("Assistant:"):].strip()

        return text

    except Exception as e:
        print("LLM ERROR:", e)
        return ""