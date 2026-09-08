document.addEventListener(
    "DOMContentLoaded",
    async () => {
        const page = document.querySelector(".productPage");
        if (!page) return;

        const id = page.dataset.productId;

        try {
            const response = await fetch(`/api/products/${id}`);
            const product = await response.json();

            renderProduct(product);
        } catch (error) {
            console.error("Error loading product:", error);
        }
    }
);

function renderProduct(product) {
    document.title = `${product.name} — TEVOSYAN FURNITURE`;

    const mainImage = document.getElementById("productMainImage");
    if (mainImage) mainImage.src = product.image;

    setElementText("productName", product.name);
    setElementText("productCategory", product.category);
    setElementText("productDescription", product.description);
    setElementText("productPrice", typeof money === "function" ? money(product.price) : product.price + " ֏");

    const oldPriceEl = document.getElementById("productOldPrice");
    if (oldPriceEl) {
        oldPriceEl.textContent = product.old_price
            ? (typeof money === "function" ? money(product.old_price) : product.old_price + " ֏")
            : "";
    }

    setElementText("productReviews", `(${product.reviews || 0} կարծիք)`);
    setElementText("productStars", "★".repeat(Math.round(product.rating || 5)));

    const badge = document.getElementById("productBadge");
    if (badge) {
        badge.textContent = product.badge || "";
        badge.style.display = product.badge ? "inline-flex" : "none";
    }

    // Colors rendering
    const colors = document.getElementById("productColors");
    if (colors && product.colors) {
        colors.innerHTML = product.colors
            .map(
                color => `
                <button
                    type="button"
                    class="colorDot"
                    style="background:${color}"
                ></button>
                `
            )
            .join("");
    }

    // Thumbnails rendering
    const thumbnails = document.getElementById("productThumbnails");
    if (thumbnails && product.gallery) {
        thumbnails.innerHTML = product.gallery
            .map(
                (image, index) => `
                <button
                    type="button"
                    class="thumbnail ${index === 0 ? "active" : ""}"
                    data-image="${image}"
                >
                    <img src="${image}" alt="">
                </button>
                `
            )
            .join("");

        thumbnails.querySelectorAll(".thumbnail").forEach(button => {
            button.addEventListener("click", () => {
                if (mainImage) mainImage.src = button.dataset.image;
                thumbnails.querySelectorAll(".thumbnail").forEach(item => item.classList.remove("active"));
                button.classList.add("active");
            });
        });
    }

    // Quantity Counter Logic
    let quantity = 1;
    const quantityElement = document.getElementById("productQty");
    const plusBtn = document.getElementById("plusQty");
    const minusBtn = document.getElementById("minusQty");
    const addBtn = document.getElementById("addProduct");

    // Ստուգում ենք ստոկը (եթե չկա, վերցնում ենք անվերջ կամ 10)
    const maxStock = product.stock !== undefined ? product.stock : 99;

    if (plusBtn) {
        plusBtn.addEventListener("click", () => {
            if (quantity < maxStock) {
                quantity++;
                if (quantityElement) quantityElement.textContent = quantity;
            }
        });
    }

    if (minusBtn) {
        minusBtn.addEventListener("click", () => {
            if (quantity > 1) {
                quantity--;
                if (quantityElement) quantityElement.textContent = quantity;
            }
        });
    }

    if (addBtn) {
        addBtn.addEventListener("click", () => {
            if (typeof addToCart === "function") {
                addToCart(product, quantity);
            } else {
                console.warn("addToCart function is not defined globally. Saving locally...");
                // Հիմնական զամբյուղի ֆունկցիայի բացակայության դեպքում աշխատող այլընտրանքային լուծում
                let cart = JSON.parse(localStorage.getItem("cart") || "[]");
                cart.push({ ...product, qty: quantity });
                localStorage.setItem("cart", JSON.stringify(cart));
                alert("Ապրանքն ավելացվեց զամբյուղ!");
            }
        });
    }
}

function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}