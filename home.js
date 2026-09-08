document.addEventListener("DOMContentLoaded", function () {

    const container = document.getElementById("homeBestSellers");

    if (!container) {
        return;
    }


    // =====================================================
    // HELPERS
    // =====================================================

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function formatPrice(value) {

        const price = Number(value || 0);

        return new Intl.NumberFormat("hy-AM")
            .format(price) + " ֏";
    }


    function getProductId(product) {

        return Number(
            product.id ||
            product.product_id ||
            0
        );
    }


    function getProductImage(product) {

        if (product.image) {
            return product.image;
        }


        if (product.image_url) {
            return product.image_url;
        }


        if (
            Array.isArray(product.gallery) &&
            product.gallery.length > 0
        ) {

            return product.gallery[0];
        }


        return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=90";
    }


    function getDiscount(product) {

        const oldPrice =
            Number(product.old_price || 0);

        const price =
            Number(product.price || 0);


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


    function getStars(rating) {

        const value = Math.max(
            0,
            Math.min(
                5,
                Math.round(
                    Number(rating || 0)
                )
            )
        );


        let html = "";


        for (
            let i = 1;
            i <= 5;
            i++
        ) {

            html +=
                i <= value
                    ? "★"
                    : "☆";
        }


        return html;
    }


    // =====================================================
    // LOAD PRODUCTS
    // =====================================================

    async function loadProducts() {

        showLoading();


        try {

            const response =
                await fetch(
                    "/api/products",
                    {
                        method: "GET",
                        headers: {
                            "Accept": "application/json"
                        },
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Products API error: " +
                    response.status
                );
            }


            const data =
                await response.json();


            let products = [];


            if (Array.isArray(data)) {

                products = data;

            }

            else if (
                Array.isArray(
                    data.products
                )
            ) {

                products =
                    data.products;

            }

            else if (
                Array.isArray(
                    data.items
                )
            ) {

                products =
                    data.items;
            }


            if (!products.length) {

                showEmpty();

                return;
            }


            // =================================================
            // BEST SELLERS ALGORITHM
            // =================================================
            //
            // Քանի որ դեռ կարող է իրական պատվերների քանակը 0 լինել,
            // ընտրում ենք ամենահետաքրքիր ապրանքները՝
            //
            // 1. rating
            // 2. reviews
            // 3. stock
            //
            // Հետագայում backend-ի իրական վաճառքի տվյալները
            // կարող են օգտագործվել որպես առաջնային չափանիշ։
            // =================================================


            products.sort(
                function (a, b) {

                    const scoreA =
                        (
                            Number(
                                a.rating || 0
                            ) * 100
                        )
                        +
                        (
                            Number(
                                a.reviews || 0
                            ) * 2
                        )
                        +
                        (
                            Number(
                                a.stock || 0
                            ) > 0
                                ? 10
                                : 0
                        );


                    const scoreB =
                        (
                            Number(
                                b.rating || 0
                            ) * 100
                        )
                        +
                        (
                            Number(
                                b.reviews || 0
                            ) * 2
                        )
                        +
                        (
                            Number(
                                b.stock || 0
                            ) > 0
                                ? 10
                                : 0
                        );


                    return scoreB - scoreA;
                }
            );


            const bestProducts =
                products.slice(0, 3);


            renderBestSellers(
                bestProducts
            );

        }


        catch (error) {

            console.error(
                "HOME BEST SELLERS ERROR:",
                error
            );


            showError();
        }
    }


    // =====================================================
    // RENDER
    // =====================================================

    function renderBestSellers(products) {

        if (!products.length) {

            showEmpty();

            return;
        }


        container.innerHTML =
            products
                .map(
                    function (
                        product,
                        index
                    ) {

                        return renderCard(
                            product,
                            index
                        );
                    }
                )
                .join("");
    }


    // =====================================================
    // CARD
    // =====================================================

    function renderCard(product, index) {

        const id =
            getProductId(product);


        const image =
            escapeHtml(
                getProductImage(product)
            );


        const name =
            escapeHtml(
                product.name ||
                "Ապրանք"
            );


        const category =
            escapeHtml(
                product.category ||
                ""
            );


        const rating =
            Number(
                product.rating || 0
            );


        const reviews =
            Number(
                product.reviews || 0
            );


        const stock =
            Number(
                product.stock || 0
            );


        const price =
            formatPrice(
                product.price
            );


        const oldPrice =
            product.old_price
                ? formatPrice(
                    product.old_price
                )
                : "";


        const discount =
            getDiscount(product);


        const badge =
            escapeHtml(
                product.badge ||
                ""
            );


        return `

            <article
                class="best-card"
                data-product-id="${id}"
            >

                <!-- IMAGE -->

                <div
                    class="best-card-image"
                >

                    <a
                        href="/product/${id}"
                        class="best-card-image-link"
                    >

                        <img
                            src="${image}"
                            alt="${name}"
                            loading="${
                                index === 0
                                    ? "eager"
                                    : "lazy"
                            }"
                            onerror="
                                this.onerror=null;
                                this.src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=90';
                            "
                        >

                    </a>


                    <!-- NUMBER -->

                    <span
                        class="best-card-number"
                    >
                        0${index + 1}
                    </span>


                    <!-- BEST SELLER -->

                    <span
                        class="best-card-label"
                    >
                        BEST SELLER
                    </span>


                    <!-- PRODUCT BADGE -->

                    ${
                        badge
                            ? `
                                <span
                                    class="best-card-product-badge"
                                >
                                    ${badge}
                                </span>
                              `
                            : ""
                    }


                    <!-- SALE -->

                    ${
                        discount
                            ? `
                                <span
                                    class="best-card-sale"
                                >
                                    -${discount}%
                                </span>
                              `
                            : ""
                    }


                    <!-- DETAIL ICON -->

                    <a
                        href="/product/${id}"
                        class="best-card-details"
                        title="Մանրամասն տեսնել"
                    >
                        ↗
                    </a>

                </div>


                <!-- CONTENT -->

                <div
                    class="best-card-content"
                >

                    <!-- CATEGORY -->

                    <span
                        class="best-card-category"
                    >
                        ${category}
                    </span>


                    <!-- NAME -->

                    <h3>

                        <a
                            href="/product/${id}"
                        >
                            ${name}
                        </a>

                    </h3>


                    <!-- RATING -->

                    <div
                        class="best-card-rating"
                    >

                        <span>
                            ${getStars(rating)}
                        </span>

                        <small>
                            ${rating.toFixed(1)}
                            ·
                            ${reviews} կարծիք
                        </small>

                    </div>


                    <!-- PRICE -->

                    <div
                        class="best-card-price"
                    >

                        <div>

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


                        ${
                            stock > 0
                                ? `
                                    <span
                                        class="best-stock"
                                    >
                                        ● Առկա է
                                    </span>
                                  `
                                : `
                                    <span
                                        class="best-stock no-stock"
                                    >
                                        ● Առկա չէ
                                    </span>
                                  `
                        }

                    </div>


                    <!-- FOOTER -->

                    <div
                        class="best-card-footer"
                    >

                        <a
                            href="/product/${id}"
                            class="best-view-button"
                        >

                            Մանրամասներ

                            <b>
                                →
                            </b>

                        </a>


                        ${
                            stock > 0
                                ? `
                                    <button
                                        type="button"
                                        class="best-cart-button"
                                        data-product-id="${id}"
                                    >
                                        <span>
                                            +
                                        </span>
                                        Զամբյուղ
                                    </button>
                                  `
                                : ""
                        }

                    </div>

                </div>

            </article>

        `;
    }


    // =====================================================
    // ADD TO CART
    // =====================================================

    function setupCartButtons() {

        const buttons =
            container.querySelectorAll(
                ".best-cart-button"
            );


        buttons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();
                        event.stopPropagation();


                        const id =
                            Number(
                                button.dataset.productId
                            );


                        const product =
                            findProductById(
                                id
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

                        else {

                            addFallbackCart(
                                product
                            );
                        }


                        button.classList.add(
                            "added"
                        );


                        button.innerHTML = `
                            <span>
                                ✓
                            </span>
                            Ավելացված է
                        `;


                        setTimeout(
                            function () {

                                button.classList.remove(
                                    "added"
                                );


                                button.innerHTML = `
                                    <span>
                                        +
                                    </span>
                                    Զամբյուղ
                                `;

                            },
                            1400
                        );

                    }
                );

            }
        );
    }


    let loadedProducts = [];


    function findProductById(id) {

        return loadedProducts.find(
            function (product) {

                return Number(
                    getProductId(product)
                ) === Number(id);

            }
        );
    }


    function addFallbackCart(product) {

        let cart = [];


        try {

            cart =
                JSON.parse(
                    localStorage.getItem(
                        "cart"
                    ) || "[]"
                );


            if (
                !Array.isArray(cart)
            ) {

                cart = [];
            }

        }

        catch {

            cart = [];
        }


        const id =
            getProductId(product);


        const existing =
            cart.find(
                function (item) {

                    return Number(
                        item.id ||
                        item.product_id
                    ) === id;

                }
            );


        if (existing) {

            existing.quantity =
                Number(
                    existing.quantity || 1
                ) + 1;

        }

        else {

            cart.push({

                id: id,

                name:
                    product.name || "",

                price:
                    Number(
                        product.price || 0
                    ),

                image:
                    getProductImage(
                        product
                    ),

                quantity: 1

            });
        }


        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );
    }


    // =====================================================
    // STATUS
    // =====================================================

    function showLoading() {

        container.innerHTML = `

            <div
                class="best-loading"
            >
                <div class="best-loading-line"></div>

                <span>
                    Բեռնվում է...
                </span>
            </div>

        `;
    }


    function showEmpty() {

        container.innerHTML = `

            <div
                class="best-error"
            >

                <h3>
                    Ապրանքներ դեռ չկան
                </h3>

                <p>
                    Ապրանքները ավելացրեք Admin բաժնից։
                </p>

            </div>

        `;
    }


    function showError() {

        container.innerHTML = `

            <div
                class="best-error"
            >

                <h3>
                    Չհաջողվեց բեռնել ապրանքները
                </h3>

                <p>
                    Ստուգեք, որ Flask-ը աշխատում է։
                </p>

                <button
                    type="button"
                    id="bestRetry"
                >
                    Կրկին փորձել
                </button>

            </div>

        `;


        const retry =
            document.getElementById(
                "bestRetry"
            );


        if (retry) {

            retry.addEventListener(
                "click",
                loadProducts
            );
        }
    }


    // =====================================================
    // START
    // =====================================================

    fetch(
        "/api/products",
        {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            cache: "no-store"
        }
    )

    .then(
        function (response) {

            if (!response.ok) {

                throw new Error(
                    "API " +
                    response.status
                );
            }


            return response.json();
        }
    )

    .then(
        function (data) {

            if (Array.isArray(data)) {

                loadedProducts =
                    data;
            }

            else if (
                Array.isArray(
                    data.products
                )
            ) {

                loadedProducts =
                    data.products;
            }

            else {

                loadedProducts =
                    [];
            }


            loadedProducts.sort(
                function (a, b) {

                    const scoreA =
                        Number(a.rating || 0) * 100 +
                        Number(a.reviews || 0) * 2 +
                        (
                            Number(a.stock || 0) > 0
                                ? 10
                                : 0
                        );


                    const scoreB =
                        Number(b.rating || 0) * 100 +
                        Number(b.reviews || 0) * 2 +
                        (
                            Number(b.stock || 0) > 0
                                ? 10
                                : 0
                        );


                    return scoreB - scoreA;
                }
            );


            renderBestSellers(
                loadedProducts.slice(0, 3)
            );


            setupCartButtons();

        }
    )

    .catch(
        function (error) {

            console.error(
                "HOME JS ERROR:",
                error
            );


            showError();
        }
    );

});