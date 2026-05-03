from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os

from chatbot import chat
from sheets import get_all_properties

load_dotenv()

app = FastAPI(title="RAW Real Estate Chatbot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[Message]

class ChatResponse(BaseModel):
    reply: str
    lead_captured: bool
    lead_saved: bool

@app.get("/")
def root():
    return {"status": "RAW Real Estate Chatbot API is running 🏠"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    try:
        messages = [{"role": m.role, "content": m.content} for m in req.messages]
        result = chat(messages)
        return ChatResponse(
            reply=result["reply"],
            lead_captured=result["lead_captured"],
            lead_saved=result["lead_saved"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/properties")
def list_properties():
    try:
        props = get_all_properties()
        return {"count": len(props), "properties": props}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
