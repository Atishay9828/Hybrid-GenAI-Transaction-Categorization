import onnxruntime as ort

def load_classifier():
    session = ort.InferenceSession("models/distilbert.onnx")
    return session