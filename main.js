const CART_KEY = "tevosyan_furniture_cart";

function getCart() {
    try {
        return JSON.parse(
            localStorage.getItem(CART_KEY)
        ) || [];
    } catch {
        return [];
    }
}


function saveCart(cart) {
    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

    updateCartCount();
}


function money(value) {
    return new Intl.NumberFormat(
        "hy-AM"
    ).format(value) + " ֏";
}


function updateCartCount() {

    const cart = getCart();

    const count = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const element = document.getElementById(
        "cartCount"
    );

    if (element) {
        element.textContent = count;
    }
}


function addToCart(product, quantity = 1) {

    const cart = getCart();

    const existing = cart.find(
        item => item.id === product.id
    );

    if (existing) {
        existing.quantity += quantity;
    } else {

        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });

    }

    saveCart(cart);

    showToast(
        `${product.name} — ավելացվեց զամբյուղ`
    );
}


function removeFromCart(id) {

    const cart = getCart().filter(
        item => item.id !== id
    );

    saveCart(cart);
}


function showToast(message) {

    const toast = document.getElementById(
        "toast"
    );

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}


function revealElements() {

    const elements = document.querySelectorAll(
        ".reveal"
    );

    if (!elements.length) return;

    const observer = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add(
                        "visible"
                    );

                    observer.unobserve(
                        entry.target
                    );
                }

            });

        },
        {
            threshold: 0.12
        }
    );

    elements.forEach(
        element => observer.observe(element)
    );
}


document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateCartCount();

        revealElements();


        const loader =
            document.getElementById("pageLoader");

        if (loader) {

            setTimeout(() => {
                loader.classList.add("hide");
            }, 600);

        }


        const searchButton =
            document.getElementById("searchButton");

        const searchOverlay =
            document.getElementById("searchOverlay");

        const closeSearch =
            document.getElementById("closeSearch");

        const globalSearch =
            document.getElementById("globalSearch");


        if (searchButton) {

            searchButton.addEventListener(
                "click",
                () => {

                    searchOverlay.classList.add(
                        "active"
                    );

                    setTimeout(
                        () => globalSearch.focus(),
                        100
                    );

                }
            );

        }


        if (closeSearch) {

            closeSearch.addEventListener(
                "click",
                () => {
                    searchOverlay.classList.remove(
                        "active"
                    );
                }
            );

        }


        if (globalSearch) {

            globalSearch.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter" &&
                        globalSearch.value.trim()
                    ) {

                        window.location.href =
                            `/shop?q=${encodeURIComponent(
                                globalSearch.value.trim()
                            )}`;

                    }

                }
            );

        }

    }
);