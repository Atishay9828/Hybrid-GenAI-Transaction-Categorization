import streamlit as st
import requests

st.title("Hybrid GenAI Transaction Categorizer")

text = st.text_input("Enter transaction:")
if st.button("Predict"):
    r = requests.post("http://localhost:8000/predict", json={"text": text})
    st.write(r.json())