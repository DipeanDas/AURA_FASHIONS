// State Management
let cart = JSON.parse(localStorage.getItem('aura_cart')) || [];
const API_BASE = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    initScrollEffects();
    initIntersectionObserver();
    
    // Page specific logic
    if (document.getElementById('product-grid')) {
        loadProducts();
    }
    
    if (document.getElementById('checkout-items')) {
        loadCheckout();
    }

    if (document.getElementById('contact-form')) {
        initContactForm();
    }

    initCartDrawer();
    initChat();
});

// --- UI Effects ---
function initScrollEffects() {
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function initIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// --- Cart Logic ---
function initCartDrawer() {
    const cartBtn = document.querySelector('.cart-icon');
    const closeBtn = document.querySelector('.close-cart');
    const drawer = document.querySelector('.cart-drawer');

    if (cartBtn) cartBtn.addEventListener('click', () => {
        renderCartItems();
        drawer.classList.add('open');
    });
    if (closeBtn) closeBtn.addEventListener('click', () => drawer.classList.remove('open'));
}

function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    updateCartCount();
    showCartDrawer();
}

function saveCart() {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        const total = cart.reduce((acc, item) => acc + item.quantity, 0);
        countEl.textContent = total;
    }
}

function showCartDrawer() {
    renderCartItems();
    document.querySelector('.cart-drawer').classList.add('open');
}

function renderCartItems() {
    const container = document.getElementById('cart-items-list');
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 2rem;">Your cart is empty.</p>';
        updateTotal(0);
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image_url}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.quantity} x $${item.price.toLocaleString()}</p>
                <button onclick="removeFromCart(${item.id})" style="background:none; border:none; color:#C5A059; cursor:pointer; font-size:0.7rem;">REMOVE</button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    updateTotal(total);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartCount();
    renderCartItems();
}

function updateTotal(total) {
    const el = document.getElementById('cart-total');
    if (el) el.textContent = `$${total.toLocaleString()}`;
}

// --- API Interactions ---
async function loadProducts() {
    const grid = document.getElementById('product-grid');
    try {
        const res = await fetch(`${API_BASE}/products`);
        const products = await res.json();
        
        grid.innerHTML = products.map(p => `
            <div class="product-card fade-in">
                <img src="${p.image_url}" alt="${p.name}" class="product-image">
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p class="product-price">$${p.price.toLocaleString()}</p>
                    <button class="btn-add" onclick='addToCart(${JSON.stringify(p)})'>Add to Cart</button>
                </div>
            </div>
        `).join('');
        
        initIntersectionObserver(); // Re-init for new elements
    } catch (err) {
        grid.innerHTML = '<p>Unable to load our collection at this moment.</p>';
    }
}

// --- Checkout ---
function loadCheckout() {
    const container = document.getElementById('checkout-items');
    const totalEl = document.getElementById('checkout-total');
    
    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div style="display:flex; justify-content:space-between; margin-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:0.5rem;">
            <span>${item.name} (x${item.quantity})</span>
            <span>$${(item.price * item.quantity).toLocaleString()}</span>
        </div>
    `).join('');

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    totalEl.textContent = `$${total.toLocaleString()}`;

    document.getElementById('payment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = 'AUTHENTICATING...';
        btn.disabled = true;

        try {
            const res = await fetch(`${API_BASE}/process-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.map(i => ({ id: i.id, quantity: i.quantity })),
                    total: total,
                    card_name: document.getElementById('card-name').value
                })
            });
            const data = await res.json();
            if (data.status === "Payment Successful") {
                alert('Order Confirmed. Welcome to the Aura Circle.');
                cart = [];
                saveCart();
                window.location.href = 'index.html';
            }
        } catch (err) {
            alert('Payment failed. Please try again.');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
}

// --- Contact Form ---
function initContactForm() {
    const form = document.getElementById('contact-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            name: form.name.value,
            email: form.email.value,
            subject: form.subject.value,
            message: form.message.value
        };

        try {
            const res = await fetch(`${API_BASE}/contact-submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            alert(data.message);
            form.reset();
        } catch (err) {
            alert('Submission failed.');
        }
    });
}

// --- Concierge Chat ---
function initChat() {
    const fab = document.getElementById('chat-fab');
    const win = document.getElementById('chat-window');
    const close = document.getElementById('close-chat');
    const input = document.getElementById('chat-input');
    const send = document.getElementById('chat-send');
    const msgs = document.getElementById('chat-messages');

    fab.addEventListener('click', () => win.classList.toggle('open'));
    close.addEventListener('click', () => win.classList.remove('open'));

    const addMsg = (text, type) => {
        const div = document.createElement('div');
        div.className = `message ${type}`;
        div.textContent = text;
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    };

    const handleSend = async () => {
        const text = input.value.trim();
        if (!text) return;

        addMsg(text, 'user');
        input.value = '';

        try {
            const res = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await res.json();
            setTimeout(() => addMsg(data.response, 'bot'), 500);
        } catch (err) {
            addMsg("I apologize, but my connection is momentarily interrupted.", 'bot');
        }
    };

    send.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
}
