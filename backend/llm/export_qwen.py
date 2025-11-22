from optimum.intel.openvino import OVModelForCausalLM
from transformers import AutoTokenizer
import os

MODEL_DIR = "./backend/llm/raw_qwen"
OUT_DIR = "./backend/llm/ov_model"

print("🔄 Exporting Qwen → OpenVINO ...")

tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)

ov_model = OVModelForCausalLM.from_pretrained(
    MODEL_DIR,
    export=True,          # ⭐ This belongs to Optimum, NOT Transformers
    compile=False,        # We'll compile later
    save_directory=OUT_DIR
)

print("✅ Export complete!")
print("Saving to:", os.path.abspath(OUT_DIR))