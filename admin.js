document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // =========================================================
    // ELEMENTS
    // =========================================================

    const productsBody = document.getElementById("productsTableBody");
    const ordersBody = document.getElementById("ordersTableBody");

    const productModal = document.getElementById("productModal");
    const productForm = document.getElementById("productForm");

    const addProductBtn = document.getElementById("addProductBtn");
    const closeProductModal = document.getElementById("closeProductModal");
    const cancelProductBtn = document.getElementById("cancelProductBtn");

    const productSearch = document.getElementById("adminProductSearch");
    const orderSearch = document.getElementById("adminOrderSearch");

    // =========================================================
    // STATE
    // =========================================================

    let products = [];
    let orders = [];
    let editingProductId = null;

    // =========================================================
    // HELPERS
    // =========================================================

    function money(value) {
        const number = Number(value || 0);

        return (
            new Intl.NumberFormat("hy-AM", {
                maximumFractionDigits: 0
            }).format(number) + " ֏"
        );
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function showMessage(message) {
        if (typeof window.showToast === "function") {
            window.showToast(message);
            return;
        }

        alert(message);
    }

    function setText(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }

    function getValue(id) {
        const element = document.getElementById(id);
        return element ? element.value : "";
    }

    function setValue(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.value = value ?? "";
        }
    }

    // =========================================================
    // API
    // =========================================================

    async function api(url, options = {}) {
        const requestOptions = {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        };

        let response;

        try {
            response = await fetch(url, requestOptions);
        } catch (error) {
            console.error("FETCH ERROR:", error);

            throw new Error(
                "Չհաջողվեց կապ հաստատել սերվերի հետ"
            );
        }

        let data = {};

        try {
            data = await response.json();
        } catch {
            data = {};
        }

        if (!response.ok) {
            throw new Error(
                data.message ||
                data.error ||
                `Սերվերի սխալ (${response.status})`
            );
        }

        return data;
    }

    // =========================================================
    // LOAD ADMIN
    // =========================================================

    async function loadAdmin() {
        try {
            await Promise.all([
                loadProducts(),
                loadOrders(),
                loadStats()
            ]);

            console.log("TEVOSYAN FURNITURE Admin loaded");
        } catch (error) {
            console.error(error);

            showMessage(
                error.message ||
                "Admin տվյալները չհաջողվեց բեռնել։"
            );
        }
    }

    // =========================================================
    // PRODUCTS
    // =========================================================

    async function loadProducts() {
        const data = await api("/api/products");

        products = Array.isArray(data)
            ? data
            : [];

        renderProducts();
    }

    function renderProducts() {
        if (!productsBody) {
            return;
        }

        const search = (
            productSearch?.value || ""
        )
            .trim()
            .toLocaleLowerCase("hy-AM");

        const filtered = products.filter(product => {
            const name = String(
                product.name || ""
            ).toLocaleLowerCase("hy-AM");

            const category = String(
                product.category || ""
            ).toLocaleLowerCase("hy-AM");

            const badge = String(
                product.badge || ""
            ).toLocaleLowerCase("hy-AM");

            return (
                name.includes(search) ||
                category.includes(search) ||
                badge.includes(search)
            );
        });

        if (!filtered.length) {
            productsBody.innerHTML = `
                <tr>
                    <td
                        colspan="5"
                        class="empty-state"
                    >
                        Ապրանքներ չեն գտնվել
                    </td>
                </tr>
            `;

            return;
        }

        productsBody.innerHTML = filtered
            .map(product => {
                const stock = Number(
                    product.stock || 0
                );

                let stockClass = "stock-ok";
                let stockText = `${stock} հատ`;

                if (stock <= 0) {
                    stockClass = "stock-out";
                    stockText = "Չկա";
                } else if (stock <= 3) {
                    stockClass = "stock-low";
                }

                const oldPrice = Number(
                    product.old_price || 0
                );

                const price = Number(
                    product.price || 0
                );

                const oldPriceHtml =
                    oldPrice > price
                        ? `
                            <div
                                style="
                                    font-size:10px;
                                    color:#aaa;
                                    text-decoration:line-through;
                                    margin-top:2px;
                                "
                            >
                                ${money(oldPrice)}
                            </div>
                        `
                        : "";

                const image =
                    product.image ||
                    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80";

                return `
                    <tr>

                        <td>
                            <div class="product-admin">

                                <img
                                    class="product-thumb"
                                    src="${escapeHtml(image)}"
                                    alt="${escapeHtml(product.name || "Ապրանք")}"
                                    loading="lazy"
                                    onerror="
                                        this.onerror=null;
                                        this.src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80';
                                    "
                                >

                                <div
                                    style="
                                        min-width:0;
                                        overflow:hidden;
                                    "
                                >

                                    <div
                                        class="product-admin-name"
                                        title="${escapeHtml(product.name || "")}"
                                    >
                                        ${escapeHtml(product.name || "Ապրանք")}
                                    </div>

                                    <div class="product-admin-category">
                                        ID #${escapeHtml(product.id)}
                                        ·
                                        ${escapeHtml(product.badge || "Առանց նշման")}
                                    </div>

                                </div>

                            </div>
                        </td>

                        <td>
                            ${escapeHtml(
                                product.category || "—"
                            )}
                        </td>

                        <td>
                            <strong>
                                ${money(price)}
                            </strong>

                            ${oldPriceHtml}
                        </td>

                        <td>
                            <span
                                class="stock-pill ${stockClass}"
                            >
                                ${stockText}
                            </span>
                        </td>

                        <td>
                            <div class="row-actions">

                                <button
                                    type="button"
                                    class="icon-btn"
                                    title="Խմբագրել"
                                    aria-label="Խմբագրել"
                                    onclick="editProduct(${Number(product.id)})"
                                >
                                    ✎
                                </button>

                                <button
                                    type="button"
                                    class="icon-btn delete"
                                    title="Ջնջել"
                                    aria-label="Ջնջել"
                                    onclick="deleteProduct(${Number(product.id)})"
                                >
                                    ×
                                </button>

                            </div>
                        </td>

                    </tr>
                `;
            })
            .join("");
    }

    // =========================================================
    // ADD PRODUCT
    // =========================================================

    function openAddProduct() {
        editingProductId = null;

        if (productForm) {
            productForm.reset();
        }

        setValue("productId", "");

        setValue("productStock", 0);
        setValue("productRating", 5);
        setValue("productReviews", 0);
        setValue("productOldPrice", "");

        const title =
            document.getElementById(
                "productModalTitle"
            );

        if (title) {
            title.textContent =
                "Ավելացնել ապրանք";
        }

        openModal();
    }

    // =========================================================
    // EDIT PRODUCT
    // =========================================================

    window.editProduct = function (id) {
        const product = products.find(
            item =>
                Number(item.id) ===
                Number(id)
        );

        if (!product) {
            showMessage(
                "Ապրանքը չի գտնվել"
            );

            return;
        }

        editingProductId =
            Number(product.id);

        setValue(
            "productId",
            product.id
        );

        setValue(
            "productName",
            product.name
        );

        setValue(
            "productCategory",
            product.category
        );

        setValue(
            "productBadge",
            product.badge
        );

        setValue(
            "productPrice",
            product.price
        );

        setValue(
            "productOldPrice",
            product.old_price
        );

        setValue(
            "productStock",
            product.stock
        );

        setValue(
            "productRating",
            product.rating ?? 5
        );

        setValue(
            "productReviews",
            product.reviews ?? 0
        );

        setValue(
            "productImage",
            product.image
        );

        const gallery = Array.isArray(
            product.gallery
        )
            ? product.gallery
            : [];

        setValue(
            "productGallery",
            gallery.join("\n")
        );

        setValue(
            "productDescription",
            product.description
        );

        setValue(
            "productDetails",
            product.details
        );

        const title =
            document.getElementById(
                "productModalTitle"
            );

        if (title) {
            title.textContent =
                "Խմբագրել ապրանքը";
        }

        openModal();
    };

    // =========================================================
    // GET PRODUCT DATA FROM FORM
    // =========================================================

    function getProductFormData() {
        const galleryValue =
            getValue("productGallery");

        const gallery =
            galleryValue
                .split(/\r?\n/)
                .map(item => item.trim())
                .filter(Boolean);

        return {
            name:
                getValue("productName")
                    .trim(),

            category:
                getValue("productCategory")
                    .trim(),

            badge:
                getValue("productBadge")
                    .trim(),

            price:
                Number(
                    getValue("productPrice") ||
                    0
                ),

            old_price:
                Number(
                    getValue("productOldPrice") ||
                    0
                ),

            stock:
                Number(
                    getValue("productStock") ||
                    0
                ),

            rating:
                Number(
                    getValue("productRating") ||
                    5
                ),

            reviews:
                Number(
                    getValue("productReviews") ||
                    0
                ),

            image:
                getValue("productImage")
                    .trim(),

            gallery,

            description:
                getValue(
                    "productDescription"
                ).trim(),

            details:
                getValue(
                    "productDetails"
                ).trim()
        };
    }

    // =========================================================
    // VALIDATION
    // =========================================================

    function validateProduct(data) {
        if (!data.name) {
            showMessage(
                "Գրիր ապրանքի անունը"
            );

            return false;
        }

        if (!data.category) {
            showMessage(
                "Ընտրիր կատեգորիան"
            );

            return false;
        }

        if (!data.image) {
            showMessage(
                "Ավելացրու հիմնական նկարի URL-ը"
            );

            return false;
        }

        if (!Number.isFinite(data.price) || data.price <= 0) {
            showMessage(
                "Գինը պետք է լինի 0-ից մեծ"
            );

            return false;
        }

        if (!Number.isFinite(data.old_price) || data.old_price < 0) {
            showMessage(
                "Հին գինը սխալ է"
            );

            return false;
        }

        if (!Number.isFinite(data.stock) || data.stock < 0) {
            showMessage(
                "Քանակը չի կարող բացասական լինել"
            );

            return false;
        }

        if (
            !Number.isFinite(data.rating) ||
            data.rating < 0 ||
            data.rating > 5
        ) {
            showMessage(
                "Գնահատականը պետք է լինի 0-5"
            );

            return false;
        }

        if (
            !Number.isFinite(data.reviews) ||
            data.reviews < 0
        ) {
            showMessage(
                "Կարծիքների քանակը սխալ է"
            );

            return false;
        }

        return true;
    }

    // =========================================================
    // SAVE PRODUCT
    // =========================================================

    if (productForm) {
        productForm.addEventListener(
            "submit",
            async event => {
                event.preventDefault();

                const data =
                    getProductFormData();

                if (!validateProduct(data)) {
                    return;
                }

                const submitButton =
                    productForm.querySelector(
                        'button[type="submit"]'
                    );

                const originalText =
                    submitButton
                        ? submitButton.textContent
                        : "";

                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent =
                        "Պահպանվում է...";
                }

                try {
                    if (editingProductId) {
                        await api(
                            `/api/products/${editingProductId}`,
                            {
                                method: "PUT",
                                body: JSON.stringify(data)
                            }
                        );

                        showMessage(
                            "Ապրանքը հաջողությամբ փոփոխվեց"
                        );
                    } else {
                        await api(
                            "/api/products",
                            {
                                method: "POST",
                                body: JSON.stringify(data)
                            }
                        );

                        showMessage(
                            "Ապրանքը հաջողությամբ ավելացվեց"
                        );
                    }

                    closeModal();

                    await Promise.all([
                        loadProducts(),
                        loadStats()
                    ]);

                } catch (error) {
                    console.error(error);

                    showMessage(
                        error.message ||
                        "Ապրանքը պահպանել չհաջողվեց"
                    );
                } finally {
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent =
                            originalText ||
                            "Պահպանել ապրանքը";
                    }
                }
            }
        );
    }

    // =========================================================
    // DELETE PRODUCT
    // =========================================================

    window.deleteProduct = async function (id) {
        const product = products.find(
            item =>
                Number(item.id) ===
                Number(id)
        );

        if (!product) {
            return;
        }

        const confirmed = confirm(
            `Ջնջե՞լ «${product.name}» ապրանքը։`
        );

        if (!confirmed) {
            return;
        }

        try {
            await api(
                `/api/products/${id}`,
                {
                    method: "DELETE"
                }
            );

            showMessage(
                "Ապրանքը հաջողությամբ ջնջվեց"
            );

            await Promise.all([
                loadProducts(),
                loadStats()
            ]);

        } catch (error) {
            console.error(error);

            showMessage(
                error.message ||
                "Ապրանքը ջնջել չհաջողվեց"
            );
        }
    };

    // =========================================================
    // ORDERS
    // =========================================================

    async function loadOrders() {
        const data =
            await api("/api/orders");

        orders = Array.isArray(data)
            ? data
            : [];

        renderOrders();
    }

    function renderOrders() {
        if (!ordersBody) {
            return;
        }

        const search = (
            orderSearch?.value || ""
        )
            .trim()
            .toLocaleLowerCase("hy-AM");

        const filtered = orders.filter(
            order => {
                const id =
                    String(
                        order.id || ""
                    ).toLocaleLowerCase(
                        "hy-AM"
                    );

                const name =
                    String(
                        order.customer_name ||
                        ""
                    ).toLocaleLowerCase(
                        "hy-AM"
                    );

                const phone =
                    String(
                        order.phone ||
                        ""
                    ).toLocaleLowerCase(
                        "hy-AM"
                    );

                const status =
                    String(
                        order.status ||
                        ""
                    ).toLocaleLowerCase(
                        "hy-AM"
                    );

                return (
                    id.includes(search) ||
                    name.includes(search) ||
                    phone.includes(search) ||
                    status.includes(search)
                );
            }
        );

        if (!filtered.length) {
            ordersBody.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        class="empty-state"
                    >
                        Պատվերներ չկան
                    </td>
                </tr>
            `;

            return;
        }

        const statuses = [
            "Նոր",
            "Հաստատված",
            "Պատրաստվում է",
            "Առաքվում է",
            "Ավարտված",
            "Չեղարկված"
        ];

        ordersBody.innerHTML =
            filtered
                .map(order => {
                    const items =
                        Array.isArray(
                            order.items
                        )
                            ? order.items
                            : [];

                    const itemText =
                        items
                            .map(item => {
                                const name =
                                    item.name ||
                                    "Ապրանք";

                                const quantity =
                                    Number(
                                        item.quantity ||
                                        0
                                    );

                                return `${name} × ${quantity}`;
                            })
                            .join(", ");

                    return `
                        <tr>

                            <td>
                                <strong>
                                    #${escapeHtml(order.id)}
                                </strong>
                            </td>

                            <td>
                                <strong>
                                    ${escapeHtml(
                                        order.customer_name ||
                                        "—"
                                    )}
                                </strong>

                                <small
                                    style="
                                        display:block;
                                        opacity:.55;
                                        margin-top:3px;
                                    "
                                >
                                    ${escapeHtml(
                                        order.phone ||
                                        "—"
                                    )}
                                </small>
                            </td>

                            <td>
                                <div
                                    class="order-items"
                                    title="${escapeHtml(itemText)}"
                                >
                                    ${escapeHtml(
                                        itemText ||
                                        "—"
                                    )}
                                </div>
                            </td>

                            <td>
                                <strong>
                                    ${money(order.total)}
                                </strong>
                            </td>

                            <td>
                                <select
                                    class="order-status"
                                    data-order-id="${escapeHtml(order.id)}"
                                >
                                    ${statuses
                                        .map(
                                            status => `
                                                <option
                                                    value="${escapeHtml(status)}"
                                                    ${
                                                        status === order.status
                                                            ? "selected"
                                                            : ""
                                                    }
                                                >
                                                    ${escapeHtml(status)}
                                                </option>
                                            `
                                        )
                                        .join("")}
                                </select>
                            </td>

                            <td>
                                ${escapeHtml(
                                    order.created_at ||
                                    "—"
                                )}
                            </td>

                            <td>
                                <button
                                    class="order-view"
                                    type="button"
                                    onclick="viewOrder(${Number(order.id)})"
                                >
                                    Դիտել
                                </button>
                            </td>

                        </tr>
                    `;
                })
                .join("");

        // =====================================================
        // ORDER STATUS EVENTS
        // =====================================================

        document
            .querySelectorAll(
                ".order-status"
            )
            .forEach(select => {
                select.addEventListener(
                    "change",
                    async event => {
                        const id =
                            event.target.dataset
                                .orderId;

                        const status =
                            event.target.value;

                        event.target.disabled =
                            true;

                        try {
                            await api(
                                `/api/orders/${id}`,
                                {
                                    method: "PUT",
                                    body:
                                        JSON.stringify(
                                            {
                                                status
                                            }
                                        )
                                }
                            );

                            showMessage(
                                "Պատվերի կարգավիճակը փոխվեց"
                            );

                            await Promise.all([
                                loadOrders(),
                                loadProducts(),
                                loadStats()
                            ]);

                        } catch (error) {
                            console.error(error);

                            showMessage(
                                error.message ||
                                "Չհաջողվեց փոխել կարգավիճակը"
                            );

                            await loadOrders();

                        } finally {
                            event.target.disabled =
                                false;
                        }
                    }
                );
            });
    }

    // =========================================================
    // VIEW ORDER
    // =========================================================

    window.viewOrder = function (id) {
        const order = orders.find(
            item =>
                Number(item.id) ===
                Number(id)
        );

        if (!order) {
            return;
        }

        const items =
            Array.isArray(order.items)
                ? order.items
                : [];

        const itemList =
            items
                .map(item => {
                    const name =
                        item.name ||
                        "Ապրանք";

                    const quantity =
                        Number(
                            item.quantity ||
                            0
                        );

                    const subtotal =
                        money(
                            item.subtotal
                        );

                    return (
                        `• ${name} × ${quantity} — ${subtotal}`
                    );
                })
                .join("\n");

        const message =
`ՊԱՏՎԵՐ #${order.id}

Հաճախորդ՝ ${order.customer_name || "—"}

Հեռախոս՝ ${order.phone || "—"}

Հասցե՝ ${order.address || "—"}

Մեկնաբանություն՝
${order.comment || "—"}

Ապրանքներ՝
${itemList || "—"}

Ընդհանուր՝ ${money(order.total)}

Կարգավիճակ՝ ${order.status || "—"}

Ամսաթիվ՝ ${order.created_at || "—"}`;

        alert(message);
    };

    // =========================================================
    // STATS
    // =========================================================

    async function loadStats() {
        const stats =
            await api("/api/stats");

        setText(
            "statProducts",
            stats.products ?? 0
        );

        setText(
            "statOrders",
            stats.orders ?? 0
        );

        setText(
            "statPending",
            stats.pending ?? 0
        );

        setText(
            "statRevenue",
            money(stats.revenue)
        );

        setText(
            "statLowStock",
            stats.low_stock ?? 0
        );
    }

    // =========================================================
    // MODAL
    // =========================================================

    function openModal() {
        if (!productModal) {
            return;
        }

        productModal.classList.add(
            "active"
        );

        productModal.style.display =
            "flex";

        productModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );

        setTimeout(() => {
            const firstInput =
                document.getElementById(
                    "productName"
                );

            if (firstInput) {
                firstInput.focus();
            }
        }, 80);
    }

    function closeModal() {
        if (!productModal) {
            return;
        }

        productModal.classList.remove(
            "active"
        );

        productModal.style.display =
            "none";

        productModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

        editingProductId = null;
    }

    // =========================================================
    // EVENT LISTENERS
    // =========================================================

    if (addProductBtn) {
        addProductBtn.addEventListener(
            "click",
            openAddProduct
        );
    }

    if (closeProductModal) {
        closeProductModal.addEventListener(
            "click",
            closeModal
        );
    }

    if (cancelProductBtn) {
        cancelProductBtn.addEventListener(
            "click",
            closeModal
        );
    }

    if (productModal) {
        productModal.addEventListener(
            "click",
            event => {
                if (
                    event.target ===
                    productModal
                ) {
                    closeModal();
                }
            }
        );
    }

    // ESC => CLOSE MODAL

    document.addEventListener(
        "keydown",
        event => {
            if (
                event.key === "Escape" &&
                productModal &&
                productModal.classList.contains(
                    "active"
                )
            ) {
                closeModal();
            }
        }
    );

    // SEARCH PRODUCTS

    if (productSearch) {
        productSearch.addEventListener(
            "input",
            renderProducts
        );
    }

    // SEARCH ORDERS

    if (orderSearch) {
        orderSearch.addEventListener(
            "input",
            renderOrders
        );
    }

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    loadAdmin();
});