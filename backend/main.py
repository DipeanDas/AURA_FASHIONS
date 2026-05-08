from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import asyncio
import os

app = FastAPI(title="AURAFASHIONS API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount frontend static files at the root AFTER defining API routes
# This will serve index.html for / and static assets correctly.
# Note: In production, we'll define this before the __main__ block.

# Models
class Product(BaseModel):
    id: int
    name: str
    price: float
    image_url: str
    description: str

class CartItem(BaseModel):
    id: int
    quantity: int

class PaymentRequest(BaseModel):
    items: List[CartItem]
    total: float
    card_name: str

class ChatRequest(BaseModel):
    message: str

class ContactRequest(BaseModel):
    name: str
    email: str
    subject: str
    message: str

# Mock Data
PRODUCTS = [
    {
        "id": 1,
        "name": "Obsidian Silk Gown",
        "price": 2400.00,
        "image_url": "products/gown.jpg",
        "description": "A floor-length gown crafted from pure Italian silk, featuring a minimalist silhouette."
    },
    {
        "id": 2,
        "name": "Champagne Cashmere Coat",
        "price": 3800.00,
        "image_url": "products/coat.jpg",
        "description": "Hand-sourced cashmere tailored into a timeless overcoat in our signature champagne hue."
    },
    {
        "id": 3,
        "name": "Aura Velvet Blazer",
        "price": 1850.00,
        "image_url": "products/blazer.jpg",
        "description": "Structural velvet blazer with hand-stitched detailing and silk lining."
    },
    {
        "id": 4,
        "name": "Luxe Leather Tote",
        "price": 1200.00,
        "image_url": "products/tote.jpg",
        "description": "Butter-soft calfskin leather tote with gold-tone hardware."
    }
]

# Endpoints
@app.get("/products", response_model=List[Product])
async def get_products():
    return PRODUCTS

@app.post("/process-payment")
async def process_payment(request: PaymentRequest):
    # Simulate payment delay
    await asyncio.sleep(2)
    return {"status": "Payment Successful", "transaction_id": "AURA-99283-XJ"}

@app.post("/chat")
async def chat(request: ChatRequest):
    msg = request.message.lower()
    
    if "material" in msg or "fabric" in msg:
        response = "At AURAFASHIONS, we pride ourselves on utilizing only the finest Italian silk and hand-sourced cashmere, ensuring a tactile experience that is as exquisite as the silhouette itself."
    elif "price" in msg or "cost" in msg:
        response = "Our pieces are investment garments, reflecting the artisanal craftsmanship and premium materials sourced globally. We believe true luxury is a timeless commitment."
    elif "shipping" in msg or "delivery" in msg:
        response = "We offer complimentary white-glove delivery worldwide. Each piece is packaged in our signature obsidian box to ensure it arrives in pristine condition."
    elif "size" in msg or "fit" in msg:
        response = "Our silhouettes are designed for a tailored yet effortless fit. Should you require a bespoke adjustment, our concierge can arrange a private fitting."
    else:
        response = "Welcome to the AURAFASHIONS Concierge. I am here to assist you in curating your perfect ensemble. How may I elevate your shopping experience today?"
    
    return {"response": response}

@app.post("/contact-submit")
async def contact_submit(request: ContactRequest):
    return {"status": "Message Received", "message": f"Thank you, {request.name}. Our team will reach out to you shortly."}

app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
