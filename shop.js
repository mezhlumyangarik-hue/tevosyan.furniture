document.addEventListener("DOMContentLoaded", () => {

    const shopGrid = document.getElementById("shopGrid");
    const shopCount = document.getElementById("shopCount");
    const shopStatus = document.getElementById("shopStatus");

    const searchInput = document.getElementById("shopSearch");
    const sortSelect = document.getElementById("sortProducts");

    const categoryButtons =
        document.querySelectorAll(".categoryFilter");

    let products = [];
    let selectedCategory = "";
    let searchText = "";
    let sortType = "default";


    // ==========================================
    // HELPERS
    // ==========================================

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function money(value) {
        return new Intl.NumberFormat("hy-AM")
            .format(Number(value || 0)) + " ֏";
    }


    function getId(product) {
        return product.id || product.product_id;
    }


    function getImage(product) {

        if (product.image) {
            return product.image;
        }

        if (product.image_url) {
            return product.image_url;
        }

        if (
            Array.isArray(product.gallery) &&
            product.gallery.length
        ) {
            return product.gallery[0];
        }

        return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=90";
    }


    function getDiscount(product) {

        const oldPrice = Number(
            product.old_price || 0
        );

        const price = Number(
            product.price || 0
        );

        if (
            oldPrice <= 0 ||
            price <= 0 ||
            oldPrice <= price
        ) {
            return 0;
        }

        return Math.round(
            ((oldPrice - price) / oldPrice) * 100
        );
    }


    function renderStars(rating) {

        const value =
            Math.round(Number(rating || 0));

        let result = "";

        for (let i = 1; i <= 5; i++) {
            result += i <= value ? "★" : "☆";
        }

        return result;
    }


    // ==========================================
    // LOAD
    // ==========================================

    async function loadProducts() {

        if (shopStatus) {
            shopStatus.textContent = "Բեռնվում է...";
        }

        try {

            const response = await fetch(
                "/api/products",
                {
                    method: "GET",
                    cache: "no-store",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


            if (!response.ok) {
                throw new Error(
                    "Products API: " + response.status
                );
            }


            const data =
                await response.json();


            if (Array.isArray(data)) {
                products = data;
            }

            else if (
                Array.isArray(data.products)
            ) {
                products = data.products;
            }

            else if (
                Array.isArray(data.items)
            ) {
                products = data.items;
            }

            else {
                products = [];
            }


            renderProducts();

        }

        catch (error) {

            console.error(
                "SHOP ERROR:",
                error
            );


            if (shopGrid) {

                shopGrid.innerHTML = `
                    <div class="catalogError">

                        <h3>
                            Չհաջողվեց բեռնել կատալոգը
                        </h3>

                        <p>
                            Ստուգեք Flask-ի console-ը։
                        </p>

                        <button
                            onclick="location.reload()"
                        >
                            Կրկին փորձել
                        </button>

                    </div>
                `;
            }
        }
    }


    // ==========================================
    // FILTER
    // ==========================================

    function getFilteredProducts() {

        let result = [...products];


        // category

        if (selectedCategory) {

            result = result.filter(product => {

                return String(
                    product.category || ""
                )
                    .trim()
                    .toLowerCase()
                    ===
                    selectedCategory
                        .trim()
                        .toLowerCase();

            });
        }


        // search

        if (searchText) {

            const query =
                searchText.toLowerCase();


            result = result.filter(product => {

                const name =
                    String(
                        product.name || ""
                    ).toLowerCase();

                const category =
                    String(
                        product.category || ""
                    ).toLowerCase();

                const description =
                    String(
                        product.description || ""
                    ).toLowerCase();


                return (
                    name.includes(query) ||
                    category.includes(query) ||
                    description.includes(query)
                );

            });
        }


        // sort

        switch (sortType) {

            case "price-low":

                result.sort(
                    (a, b) =>
                        Number(a.price || 0) -
                        Number(b.price || 0)
                );

                break;


            case "price-high":

                result.sort(
                    (a, b) =>
                        Number(b.price || 0) -
                        Number(a.price || 0)
                );

                break;


            case "rating":

                result.sort(
                    (a, b) =>
                        Number(b.rating || 0) -
                        Number(a.rating || 0)
                );

                break;


            case "new":

                result.sort(
                    (a, b) =>
                        new Date(
                            b.created_at || 0
                        ) -
                        new Date(
                            a.created_at || 0
                        )
                );

                break;

        }


        return result;
    }


    // ==========================================
    // RENDER
    // ==========================================

    function renderProducts() {

        const result =
            getFilteredProducts();


        if (shopCount) {
            shopCount.textContent =
                result.length;
        }


        if (shopStatus) {

            shopStatus.textContent =
                `${result.length} ապրանք`;
        }


        if (!result.length) {

            shopGrid.innerHTML = `
                <div class="catalogError">

                    <h3>
                        Ապրանք չի գտնվել
                    </h3>

                    <p>
                        Փորձեք փոխել որոնման կամ կատեգորիայի
                        պայմանները։
                    </p>

                </div>
            `;

            return;
        }


        shopGrid.innerHTML =
            result
                .map(renderProductCard)
                .join("");


        attachCartButtons();
    }


    // ==========================================
    // PRODUCT CARD
    // ==========================================

    function renderProductCard(product) {

        const id = getId(product);

        const image =
            escapeHtml(getImage(product));

        const name =
            escapeHtml(
                product.name || "Ապրանք"
            );

        const category =
            escapeHtml(
                product.category || ""
            );

        const price =
            money(product.price);

        const oldPrice =
            product.old_price
                ? money(product.old_price)
                : "";

        const rating =
            Number(product.rating || 0);

        const reviews =
            Number(product.reviews || 0);

        const stock =
            Number(product.stock || 0);

        const discount =
            getDiscount(product);


        return `
            <article class="premiumProductCard">


                <div class="premiumImageBox">

                    <a
                        href="/product/${id}"
                    >

                        <img
                            src="${image}"
                            alt="${name}"
                            loading="lazy"
                            onerror="
                                this.src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=90'
                            "
                        >

                    </a>


                    <div class="cardBadges">

                        ${
                            product.badge
                                ? `
                                    <span class="newBadge">
                                        ${escapeHtml(
                                            product.badge
                                        )}
                                    </span>
                                  `
                                : ""
                        }


                        ${
                            discount
                                ? `
                                    <span class="saleBadge">
                                        -${discount}%
                                    </span>
                                  `
                                : ""
                        }

                    </div>


                    <a
                        href="/product/${id}"
                        class="quickDetail"
                        title="Մանրամասներ"
                    >
                        ↗
                    </a>

                </div>


                <div class="premiumInfo">

                    <span class="premiumCategory">
                        ${category}
                    </span>


                    <h3>

                        <a
                            href="/product/${id}"
                        >
                            ${name}
                        </a>

                    </h3>


                    <div class="premiumRating">

                        <span>
                            ${renderStars(rating)}
                        </span>

                        <small>
                            ${rating.toFixed(1)}
                            ·
                            ${reviews} կարծիք
                        </small>

                    </div>


                    <div class="premiumPrice">

                        <strong>
                            ${price}
                        </strong>

                        ${
                            oldPrice
                                ? `
                                    <del>
                                        ${oldPrice}
                                    </del>
                                  `
                                : ""
                        }

                    </div>


                    <div class="premiumBottom">

                        <span
                            class="${
                                stock > 0
                                    ? "stockYes"
                                    : "stockNo"
                            }"
                        >
                            ●
                            ${
                                stock > 0
                                    ? "Առկա է"
                                    : "Առկա չէ"
                            }
                        </span>


                        <button
                            class="premiumCartBtn addToCartBtn"
                            data-id="${id}"
                            ${
                                stock <= 0
                                    ? "disabled"
                                    : ""
                            }
                        >

                            <span>
                                Զամբյուղ
                            </span>

                            <b>
                                +
                            </b>

                        </button>

                    </div>

                </div>

            </article>
        `;
    }


    // ==========================================
    // CART
    // ==========================================

    function attachCartButtons() {

        document
            .querySelectorAll(".addToCartBtn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();
                        event.stopPropagation();


                        const id =
                            Number(
                                button.dataset.id
                            );


                        const product =
                            products.find(
                                item =>
                                    Number(
                                        getId(item)
                                    ) === id
                            );


                        if (!product) {
                            return;
                        }


                        if (
                            typeof window.addToCart ===
                            "function"
                        ) {

                            window.addToCart(
                                product,
                                1
                            );

                        }


                        button.innerHTML = `
                            <span>
                                Ավելացված է
                            </span>

                            <b>
                                ✓
                            </b>
                        `;


                        setTimeout(() => {

                            button.innerHTML = `
                                <span>
                                    Զամբյուղ
                                </span>

                                <b>
                                    +
                                </b>
                            `;

                        }, 1200);

                    }
                );

            });
    }


    // ==========================================
    // SEARCH
    // ==========================================

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            event => {

                searchText =
                    event.target.value.trim();

                renderProducts();

            }
        );
    }


    // ==========================================
    // SORT
    // ==========================================

    if (sortSelect) {

        sortSelect.addEventListener(
            "change",
            event => {

                sortType =
                    event.target.value;

                renderProducts();

            }
        );
    }


    // ==========================================
    // CATEGORIES
    // ==========================================

    categoryButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                categoryButtons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                selectedCategory =
                    button.dataset.category || "";


                renderProducts();

            }
        );
    });


    // ==========================================
    // START
    // ==========================================

    loadProducts();

});