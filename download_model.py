from transformers import AutoTokenizer, AutoModelForCausalLM
import openvino as ov
import os

MODEL_ID = "Qwen/Qwen2.5-7B-Instruct"

print("🔥 Step 1: Downloading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
tokenizer.save_pretrained("./qwen-tokenizer")

print("🔥 Step 2: Downloading model + exporting to OpenVINO IR...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    export=True,                  # <-- IMPORTANT: enables OpenVINO export
    low_cpu_mem_usage=True
)

# Save OpenVINO IR model
os.makedirs("openvino", exist_ok=True)
ov.save_model(model, "openvino/qwen-openvino.xml")

print("\n🎉 Done! Your Intel Arc–optimized model is ready.")
print("Files created:")
print(" - ./openvino/qwen-openvino.xml")
print(" - ./openvino/qwen-openvino.bin")
print(" - ./qwen-tokenizer/ (tokenizer folder)")