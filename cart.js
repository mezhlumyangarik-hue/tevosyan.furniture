// Անմիջապես ստուգում ենք և կապում իրադարձությունները
function initCartPage() {
    renderCart();

    const checkout = document.getElementById("checkoutButton");
    const modal = document.getElementById("checkoutModal");
    const close = document.getElementById("closeCheckout");

    if (checkout && modal) {
        checkout.addEventListener("click", () => {
            const cart = getCart();
            if (!cart.length) {
                alert("Զամբյուղը դատարկ է");
                return;
            }
            modal.classList.add("active");
        });
    }

    if (close && modal) {
        close.addEventListener("click", () => {
            modal.classList.remove("active");
        });
    }

    const form = document.getElementById("checkoutForm");
    if (form) {
        // Հեռացնում ենք հին listener-ները և դնում նորը՝ կանխելով էջի թարմացումը
        form.onsubmit = async function(e) {
            e.preventDefault();
            await forceSubmitOrder();
        };
    }
}

// Եթե էջն արդեն բեռնվել է, միանում է միանգամից, եթե ոչ՝ սպասում է
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCartPage);
} else {
    initCartPage();
}

function renderCart() {
    const container = document.getElementById("cartItems");
    if (!container) return;

    const cart = getCart();

    if (!cart.length) {
        container.innerHTML = `
            <div class="emptyCart">
                <div class="emptyIcon">🛋</div>
                <h2>Ձեր զամբյուղը դատարկ է</h2>
                <p>Ընտրեք ձեր նախընտրած կահույքը և ավելացրեք զամբյուղ։</p>
                <a href="/shop" class="button buttonDark">Դիտել կատալոգը →</a>
            </div>
        `;
        updateTotals();
        return;
    }

    container.innerHTML = cart
        .map(
            item => `
            <article class="cartItem">
                <img src="${item.image}" alt="${item.name}">
                <div class="cartItemInfo">
                    <span>Furniture</span>
                    <h3>${item.name}</h3>
                    <strong>${money(item.price)}</strong>
                </div>
                <div class="cartQuantity">
                    <button type="button" onclick="changeQuantity(${item.id}, -1)">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" onclick="changeQuantity(${item.id}, 1)">+</button>
                </div>
                <div class="cartItemTotal">
                    <strong>${money(item.price * item.quantity)}</strong>
                    <button type="button" onclick="deleteItem(${item.id})">Հեռացնել</button>
                </div>
            </article>
            `
        )
        .join("");

    updateTotals();
}

function changeQuantity(id, amount) {
    const cart = getCart();
    const item = cart.find(product => product.id === id);
    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        const index = cart.indexOf(item);
        cart.splice(index, 1);
    }

    saveCart(cart);
    renderCart();
}

function deleteItem(id) {
    removeFromCart(id);
    renderCart();
}

function updateTotals() {
    const cart = getCart();
    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const subtotal = document.getElementById("cartSubtotal");
    const cartTotal = document.getElementById("cartTotal");

    if (subtotal) subtotal.textContent = money(total);
    if (cartTotal) cartTotal.textContent = money(total);
}

async function forceSubmitOrder() {
    const customerInput = document.getElementById("customerName");
    const phoneInput = document.getElementById("customerPhone");
    const addressInput = document.getElementById("customerAddress");
    const commentInput = document.getElementById("customerComment"); // Եթե առկա է մեկնաբանության դաշտ

    const customer = customerInput ? customerInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const address = addressInput ? addressInput.value.trim() : "";
    const comment = commentInput ? commentInput.value.trim() : "";

    if (!customer) {
        alert("Մուտքագրեք անունը");
        if (customerInput) customerInput.focus();
        return;
    }

    if (!phone) {
        alert("Մուտքագրեք հեռախոսահամարը");
        if (phoneInput) phoneInput.focus();
        return;
    }

    if (!address) {
        alert("Մուտքագրեք հասցեն");
        if (addressInput) addressInput.focus();
        return;
    }

    const cart = typeof getCart === "function" ? getCart() : JSON.parse(localStorage.getItem("cart") || "[]");
    
    if (cart.length === 0) {
        alert("Զամբյուղը դատարկ է");
        return;
    }

    // Փոխանցվող օբյեկտի բանալիները համապատասխանեցվել են app.py-ի սպասվող դաշտերին (customer_name, phone, address, comment, items)
    const order = {
        customer_name: customer,
        phone: phone,
        address: address,
        comment: comment,
        items: cart
    };

    try {
        const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(order)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            alert(result.message || "Սխալ տեղի ունեցավ սերվերում");
            return;
        }

        const cartKey = typeof CART_KEY !== "undefined" ? CART_KEY : "cart";
        localStorage.removeItem(cartKey);

        window.location.href = `/success?order=${result.order_id}`;

    } catch (error) {
        console.error("Order error:", error);
        alert("Ցանցային սխալ կամ սերվերը չի պատասխանում");
    }
}

// Համատեղելիության համար (եթե HTML-ում ֆունկցիայի անունը դեռ հինն է)
window.submitOrder = forceSubmitOrder;v