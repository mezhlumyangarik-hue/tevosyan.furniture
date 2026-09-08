from flask import Flask, render_template, request, jsonify
import sqlite3
import json
import os
import math
from datetime import datetime

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "furniture.db")

IMG = "https://images.unsplash.com"

# =========================================================
# COMPLETE CATALOG
# =========================================================

PRODUCTS = [
    # -------------------- LIVING ROOM --------------------
    {
        "name": "Modern Comfort Բազմոց",
        "category": "Հյուրասենյակ",
        "badge": "Նոր",
        "price": 285000,
        "old_price": 320000,
        "stock": 8,
        "rating": 5,
        "reviews": 18,
        "image": IMG + "/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=90",
        "gallery": [
            IMG + "/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=90",
            IMG + "/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=1400&q=90"
        ],
        "description": "Ժամանակակից, փափուկ և հարմարավետ բազմոց՝ գեղեցիկ հյուրասենյակի համար։",
        "details": "Բարձրորակ գործվածք\nԱմուր կառուցվածք\nՓափուկ նստատեղ\nԺամանակակից դիզայն"
    },
    {
        "name": "Luxury Corner Բազմոց",
        "category": "Հյուրասենյակ",
        "badge": "Հիթ",
        "price": 395000,
        "old_price": 450000,
        "stock": 5,
        "rating": 4.9,
        "reviews": 26,
        "image": IMG + "/photo-1550254478-ead40cc54513?auto=format&fit=crop&w=1400&q=90",
        "gallery": [
            IMG + "/photo-1550254478-ead40cc54513?auto=format&fit=crop&w=1400&q=90"
        ],
        "description": "Ընդարձակ անկյունային բազմոց՝ մեծ և ժամանակակից հյուրասենյակի համար։",
        "details": "Մեծ նստատեղ\nՓափուկ բարձեր\nԱմուր հիմք\nՊրեմիում տեսք"
    },
    {
        "name": "Classic Lounge Բազկաթոռ",
        "category": "Հյուրասենյակ",
        "badge": "Հիթ",
        "price": 125000,
        "old_price": 145000,
        "stock": 12,
        "rating": 4.8,
        "reviews": 14,
        "image": IMG + "/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=90",
        "gallery": [
            IMG + "/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=90"
        ],
        "description": "Էլեգանտ բազկաթոռ՝ հանգստի և ինտերիերին գեղեցիկ շեշտի համար։",
        "details": "Փափուկ նստատեղ\nՓայտե կառուցվածք\nՀարմարավետ ձև\nԷլեգանտ ոճ"
    },

    # -------------------- KITCHEN --------------------
    {
        "name": "Modern Kitchen Set",
        "category": "Խոհանոց",
        "badge": "Նոր",
        "price": 690000,
        "old_price": 760000,
        "stock": 4,
        "rating": 5,
        "reviews": 11,
        "image": IMG + "/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=1400&q=90",
        "gallery": [
            IMG + "/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=1400&q=90"
        ],
        "description": "Ժամանակակից խոհանոցի ամբողջական կահույք՝ գեղեցիկ և ֆունկցիոնալ լուծմամբ։",
        "details": "Խոնավակայուն նյութ\nԺամանակակից ֆասադներ\nՄեծ պահեստային տարածք\nԱնհատական նախագծում"
    },
    {
        "name": "Premium Kitchen",
        "category": "Խոհանոց",
        "badge": "Հիթ",
        "price": 850000,
        "old_price": 930000,
        "stock": 3,
        "rating": 4.9,
        "reviews": 9,
        "image": IMG + "/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=90",
        "gallery": [
            IMG + "/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=90"
        ],
        "description": "Պրեմիում դասի խոհանոց՝ ժամանակակից ինտերիերի համար։",
        "details": "Premium ֆասադներ\nԲարձրակարգ ֆուրնիտուրա\nՄեծ պահարաններ\nԱնհատական չափսեր"
    },
    {
        "name": "Minimal Kitchen Table",
        "category": "Խոհանոց",
        "badge": "",
        "price": 165000,
        "old_price": 190000,
        "stock": 10,
        "rating": 4.8,
        "reviews": 16,
        "image": IMG + "/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1400&q=90",
        "gallery": [
            IMG + "/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1400&q=90"
        ],
        "description": "Մինիմալիստական սեղան՝ խոհանոցի կամ ճաշասենյակի համար։",
        "details": "Ամուր սեղանածածկ\nՀեշտ մաքրվող մակերես\nԿայուն հիմք\nԺամանակակից ձևավորում"
    },

    # -------------------- BEDROOM --------------------
    {
        "name": "Royal Bedroom Set",
        "category": "Ննջասենյակ",
        "badge": "Հիթ",
        "price": 720000,
        "old_price": 790000,
        "stock": 4,
        "rating": 5,
        "reviews": 21,
        "image": IMG + "/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=90",
        "gallery": [
            IMG + "/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=90"
        ],
        "description": "Շքեղ ննջասենյակի հավաքածու՝ ամբողջական ինտերիերի համար։",
        "details": "Մահճակալ\nՊահարան\nԿոմոդ\nԿողասեղաններ"
    },
    {
        "name": "Elegant Bed",
        "category": "Ննջասենյակ",
        "badge": "Նոր",
        "price": 340000,
        "old_price": 385000,
        "stock": 7,
        "rating": 4.9,
        "reviews": 17,
        "image": IMG + "/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=90",
        "gallery": [
            IMG + "/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=90"
        ],
        "description": "Էլեգանտ և հարմարավետ մահճակալ՝ ժամանակակից ննջասենյակի համար։",
        "details": "Ամուր հիմք\nՓափուկ գլխամաս\nՀարմարավետ չափս\nԺամանակակից դիզայն"
    },
    {
        "name": "Bedroom Nightstand",
        "category": "Ննջասենյակ",
        "badge": "",
        "price": 85000,
        "old_price": 99000,
        "stock": 15,
        "rating": 4.7,
        "reviews": 12,
        "image": IMG + "/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=1400&q=90",
        "gallery": [
            IMG + "/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=1400&q=90"
        ],
        "description": "Կոմպակտ և գեղեցիկ կողասեղան՝ ննջասենյակի համար։",
        "details": "2 գզրոց\nԿոմպակտ չափս\nՀեշտ խնամք\nԺամանակակից ոճ"
    },

    # -------------------- STORAGE --------------------
    {
        "name": "Large Storage Wardrobe",
        "category": "Պահեստավորում",
        "badge": "Հիթ",
        "price": 395000,
        "old_price": 440000,
        "stock": 6,
        "rating": 4.9,
        "reviews": 24,
        "image": IMG + "/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1400&q=90",
        "gallery": [
            IMG + "/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1400&q=90"
        ],
        "description": "Մեծ տարողությամբ պահարան՝ հագուստի և իրերի հարմարավետ պահեստավորման համար։",
        "details": "Մեծ ծավալ\nԲազմաթիվ դարակներ\nԿախիչի հատված\nԺամանակակից դիզայն"
    },
    {
        "name": "Minimal Cabinet",
        "category": "Պահեստավորում",
        "badge": "",
        "price": 185000,
        "old_price": 215000,
        "stock": 9,
        "rating": 4.8,
        "reviews": 15,
        "image": IMG + "/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1400&q=90",
        "gallery": [
            IMG + "/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1400&q=90"
        ],
        "description": "Գեղեցիկ և ֆունկցիոնալ պահարան՝ տարբեր իրերի համար։",
        "details": "Բազմաֆունկցիոնալ\nԱմուր կառուցվածք\nՓակ պահեստավորում\nՄինիմալիստական ոճ"
    },
    {
        "name": "Modern Sideboard",
        "category": "Պահեստավորում",
        "badge": "Նոր",
        "price": 225000,
        "old_price": 255000,
        "stock": 7,
        "rating": 4.8,
        "reviews": 10,
        "image": IMG + "/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=1400&q=90",
        "gallery": [
            IMG + "/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=1400&q=90"
        ],
        "description": "Ժամանակակից sideboard՝ հյուրասենյակի կամ ճաշասենյակի համար։",
        "details": "Փակ պահեստավորում\nՄեծ մակերես\nՀարմար դարակներ\nԷլեգանտ դիզայն"
    },

    # -------------------- ACCESSORIES --------------------
    {
        "name": "Designer Coffee Table",
        "category": "Աքսեսուարներ",
        "badge": "Նոր",
        "price": 145000,
        "old_price": 175000,
        "stock": 10,
        "rating": 4.9,
        "reviews": 20,
        "image": IMG + "/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1400&q=90",
        "gallery": [
            IMG + "/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1400&q=90"
        ],
        "description": "Դիզայներական սուրճի սեղան՝ ժամանակակից ինտերիերի համար։",
        "details": "Կոմպակտ\nԱմուր նյութ\nՀեշտ խնամք\nԺամանակակից ձև"
    },
    {
        "name": "Luxury Floor Lamp",
        "category": "Աքսեսուարներ",
        "badge": "Հիթ",
        "price": 95000,
        "old_price": 115000,
        "stock": 14,
        "rating": 4.8,
        "reviews": 13,
        "image": IMG + "/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1400&q=90",
        "gallery": [
            IMG + "/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1400&q=90"
        ],
        "description": "Էլեգանտ հատակի լամպ՝ ինտերիերին նոր շունչ հաղորդելու համար։",
        "details": "Ժամանակակից դիզայն\nԿայուն հիմք\nՏաք լուսավորություն\nԴեկորատիվ տեսք"
    },
    {
        "name": "Decorative Lounge Chair",
        "category": "Աքսեսուարներ",
        "badge": "",
        "price": 155000,
        "old_price": 180000,
        "stock": 8,
        "rating": 4.9,
        "reviews": 19,
        "image": IMG + "/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1400&q=90",
        "gallery": [
            IMG + "/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1400&q=90"
        ],
        "description": "Հարմարավետ և դեկորատիվ բազկաթոռ՝ ինտերիերի համար։",
        "details": "Փափուկ նստատեղ\nԷրգոնոմիկ ձև\nՊրեմիում գործվածք\nՀարմարավետ կառուցվածք"
    }
]


# =========================================================
# DATABASE
# =========================================================

def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def prepare_database():
    conn = db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            category TEXT NOT NULL,
            badge TEXT DEFAULT '',
            price REAL NOT NULL DEFAULT 0,
            old_price REAL DEFAULT 0,
            stock INTEGER NOT NULL DEFAULT 0,
            rating REAL DEFAULT 5,
            reviews INTEGER DEFAULT 0,
            image TEXT DEFAULT '',
            gallery TEXT DEFAULT '[]',
            description TEXT DEFAULT '',
            details TEXT DEFAULT '',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            address TEXT DEFAULT '',
            comment TEXT DEFAULT '',
            items TEXT NOT NULL,
            total REAL NOT NULL DEFAULT 0,
            status TEXT DEFAULT 'Նոր',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()

    existing_columns = {
        row["name"] for row in conn.execute("PRAGMA table_info(products)").fetchall()
    }
    required_columns = {
        "badge": "TEXT DEFAULT ''",
        "price": "REAL NOT NULL DEFAULT 0",
        "old_price": "REAL DEFAULT 0",
        "stock": "INTEGER NOT NULL DEFAULT 0",
        "rating": "REAL DEFAULT 5",
        "reviews": "INTEGER DEFAULT 0",
        "image": "TEXT DEFAULT ''",
        "gallery": "TEXT DEFAULT '[]'",
        "description": "TEXT DEFAULT ''",
        "details": "TEXT DEFAULT ''",
        "created_at": "TEXT DEFAULT CURRENT_TIMESTAMP",
    }
    for column, definition in required_columns.items():
        if column not in existing_columns:
            conn.execute(f"ALTER TABLE products ADD COLUMN {column} {definition}")

    conn.commit()

    categories = {}

    for product in PRODUCTS:
        category = product["category"]
        if category not in categories:
            categories[category] = []
        categories[category].append(product)

    for category, products in categories.items():
        for product in products:
            if conn.execute(
                "SELECT 1 FROM products WHERE name = ?",
                (product["name"],)
            ).fetchone():
                continue

            conn.execute("""
                INSERT INTO products
                (
                    name, category, badge, price, old_price, stock,
                    rating, reviews, image, gallery, description, details
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                product["name"],
                product["category"],
                product["badge"],
                product["price"],
                product["old_price"],
                product["stock"],
                product["rating"],
                product["reviews"],
                product["image"],
                json.dumps(product["gallery"], ensure_ascii=False),
                product["description"],
                product["details"]
            ))

    conn.commit()
    conn.close()


# =========================================================
# HELPERS
# =========================================================

def product_dict(row):
    item = dict(row)
    try:
        item["gallery"] = json.loads(item.get("gallery") or "[]")
    except Exception:
        item["gallery"] = []
    return item


def parse_gallery(value):
    if isinstance(value, list):
        return [str(x).strip() for x in value if str(x).strip()]
    if not isinstance(value, str):
        return []
    return [
        line.strip()
        for line in value.replace(",", "\n").splitlines()
        if line.strip()
    ]


def clean_product(data):
    def safe_float(value, default=0):
        try:
            result = float(value)
            return result if math.isfinite(result) else default
        except (TypeError, ValueError):
            return default

    def safe_int(value, default=0):
        try:
            return int(float(value))
        except (TypeError, ValueError):
            return default

    price = max(0, safe_float(data.get("price"), 0))
    old_price = max(0, safe_float(data.get("old_price"), 0))
    stock = max(0, safe_int(data.get("stock"), 0))
    reviews = max(0, safe_int(data.get("reviews"), 0))
    rating = max(0, min(5, safe_float(data.get("rating"), 5)))

    return {
        "name": str(data.get("name", "")).strip(),
        "category": str(data.get("category", "")).strip(),
        "badge": str(data.get("badge", "")).strip(),
        "price": price,
        "old_price": old_price,
        "stock": stock,
        "rating": rating,
        "reviews": reviews,
        "image": str(data.get("image", "")).strip(),
        "gallery": parse_gallery(data.get("gallery", [])),
        "description": str(data.get("description", "")).strip(),
        "details": str(data.get("details", "")).strip()
    }


# =========================================================
# PAGES
# =========================================================

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/shop")
def shop():
    return render_template("shop.html")


@app.route("/product/<int:product_id>")
def product_page(product_id):
    return render_template("product.html", product_id=product_id)


@app.route("/cart")
def cart():
    return render_template("cart.html")


@app.route("/admin")
def admin():
    return render_template("admin.html")


@app.route("/success")
def success():
    return render_template("success.html")


# =========================================================
# PRODUCT API
# =========================================================

@app.route("/api/products", methods=["GET"])
def products_api():
    conn = db()

    category = request.args.get("category", "").strip()
    q = request.args.get("q", "").strip()

    sql = "SELECT * FROM products WHERE 1=1"
    params = []

    if category:
        sql += " AND category = ?"
        params.append(category)

    if q:
        value = f"%{q}%"
        sql += """
            AND (
                name LIKE ?
                OR category LIKE ?
                OR description LIKE ?
            )
        """
        params.extend([value, value, value])

    sql += " ORDER BY id DESC"

    rows = conn.execute(sql, params).fetchall()
    conn.close()

    return jsonify([product_dict(row) for row in rows])


@app.route("/api/products/<int:product_id>", methods=["GET"])
def one_product_api(product_id):
    conn = db()
    row = conn.execute(
        "SELECT * FROM products WHERE id = ?",
        (product_id,)
    ).fetchone()
    conn.close()

    if row is None:
        return jsonify({
            "success": False,
            "message": "Ապրանքը չի գտնվել"
        }), 404

    return jsonify(product_dict(row))


@app.route("/api/products", methods=["POST"])
def add_product():
    data = request.get_json(silent=True) or {}

    try:
        p = clean_product(data)

        if not p["name"] or not p["category"]:
            return jsonify({
                "success": False,
                "message": "Անունը և կատեգորիան պարտադիր են"
            }), 400

        if p["price"] < 0 or p["stock"] < 0:
            return jsonify({
                "success": False,
                "message": "Գինը կամ քանակը սխալ է"
            }), 400

        conn = db()

        cursor = conn.execute("""
            INSERT INTO products
            (name, category, badge, price, old_price, stock,
             rating, reviews, image, gallery, description, details)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            p["name"],
            p["category"],
            p["badge"],
            p["price"],
            p["old_price"],
            p["stock"],
            p["rating"],
            p["reviews"],
            p["image"],
            json.dumps(p["gallery"], ensure_ascii=False),
            p["description"],
            p["details"]
        ))

        conn.commit()

        row = conn.execute(
            "SELECT * FROM products WHERE id = ?",
            (cursor.lastrowid,)
        ).fetchone()

        conn.close()

        return jsonify({
            "success": True,
            "message": "Ապրանքը ավելացվեց",
            "product": product_dict(row)
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@app.route("/api/products/<int:product_id>", methods=["PUT"])
def edit_product(product_id):
    data = request.get_json(silent=True) or {}

    try:
        p = clean_product(data)

        if not p["name"] or not p["category"]:
            return jsonify({
                "success": False,
                "message": "Անունը և կատեգորիան պարտադիր են"
            }), 400

        conn = db()

        exists = conn.execute(
            "SELECT id FROM products WHERE id = ?",
            (product_id,)
        ).fetchone()

        if not exists:
            conn.close()
            return jsonify({
                "success": False,
                "message": "Ապրանքը չի գտնվել"
            }), 404

        conn.execute("""
            UPDATE products SET
                name = ?,
                category = ?,
                badge = ?,
                price = ?,
                old_price = ?,
                stock = ?,
                rating = ?,
                reviews = ?,
                image = ?,
                gallery = ?,
                description = ?,
                details = ?
            WHERE id = ?
        """, (
            p["name"],
            p["category"],
            p["badge"],
            p["price"],
            p["old_price"],
            p["stock"],
            p["rating"],
            p["reviews"],
            p["image"],
            json.dumps(p["gallery"], ensure_ascii=False),
            p["description"],
            p["details"],
            product_id
        ))

        conn.commit()

        row = conn.execute(
            "SELECT * FROM products WHERE id = ?",
            (product_id,)
        ).fetchone()

        conn.close()

        return jsonify({
            "success": True,
            "message": "Ապրանքը փոփոխվեց",
            "product": product_dict(row)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@app.route("/api/products/<int:product_id>", methods=["DELETE"])
def remove_product(product_id):
    conn = db()

    exists = conn.execute(
        "SELECT id FROM products WHERE id = ?",
        (product_id,)
    ).fetchone()

    if not exists:
        conn.close()
        return jsonify({
            "success": False,
            "message": "Ապրանքը չի գտնվել"
        }), 404

    conn.execute(
        "DELETE FROM products WHERE id = ?",
        (product_id,)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Ապրանքը ջնջվեց"
    })


# =========================================================
# BEST SELLERS
# =========================================================

@app.route("/api/best-sellers", methods=["GET"])
def best_sellers_api():
    try:
        limit = int(request.args.get("limit", 4))
    except (TypeError, ValueError):
        limit = 4

    limit = max(1, min(limit, 20))

    conn = db()
    rows = conn.execute(
        "SELECT * FROM products WHERE stock > 0"
    ).fetchall()

    sold_counts = {}

    for order in conn.execute(
        "SELECT items, status FROM orders WHERE status != 'Չեղարկված'"
    ).fetchall():
        try:
            items = json.loads(order["items"] or "[]")
        except Exception:
            items = []

        if not isinstance(items, list):
            continue

        for item in items:
            try:
                pid = int(item.get("id"))
                qty = int(item.get("quantity", 0))
            except (TypeError, ValueError):
                continue
            if pid > 0 and qty > 0:
                sold_counts[pid] = sold_counts.get(pid, 0) + qty

    result = []
    for row in rows:
        item = product_dict(row)
        item["sold_count"] = sold_counts.get(item["id"], 0)
        result.append(item)

    if any(x["sold_count"] > 0 for x in result):
        result.sort(
            key=lambda x: (x["sold_count"], x.get("reviews", 0), x.get("rating", 0)),
            reverse=True
        )
    else:
        result.sort(
            key=lambda x: (x.get("reviews", 0), x.get("rating", 0)),
            reverse=True
        )

    result = result[:limit]

    for rank, item in enumerate(result, 1):
        item["best_seller"] = True
        item["best_seller_rank"] = rank

    conn.close()
    return jsonify(result)


# =========================================================
# CATEGORIES
# =========================================================

@app.route("/api/categories")
def categories_api():
    conn = db()

    rows = conn.execute("""
        SELECT category, COUNT(*) AS count
        FROM products
        GROUP BY category
        ORDER BY category
    """).fetchall()

    conn.close()

    return jsonify([
        {
            "name": row["category"],
            "count": row["count"]
        }
        for row in rows
    ])


# =========================================================
# ORDERS
# =========================================================

@app.route("/api/orders", methods=["GET"])
def orders_api():
    conn = db()

    rows = conn.execute(
        "SELECT * FROM orders ORDER BY id DESC"
    ).fetchall()

    conn.close()

    result = []

    for row in rows:
        order = dict(row)
        try:
            order["items"] = json.loads(order.get("items") or "[]")
        except Exception:
            order["items"] = []
        result.append(order)

    return jsonify(result)


@app.route("/api/orders", methods=["POST"])
def create_order():
    data = request.get_json(silent=True) or {}

    name = str(data.get("customer_name", "")).strip()
    phone = str(data.get("phone", "")).strip()
    address = str(data.get("address", "")).strip()
    comment = str(data.get("comment", "")).strip()
    items = data.get("items", [])

    if not name:
        return jsonify({
            "success": False,
            "message": "Մուտքագրեք անունը"
        }), 400

    if not phone:
        return jsonify({
            "success": False,
            "message": "Մուտքագրեք հեռախոսահամարը"
        }), 400

    if not isinstance(items, list) or not items:
        return jsonify({
            "success": False,
            "message": "Զամբյուղը դատարկ է"
        }), 400

    conn = db()

    try:
        final_items = []
        total = 0

        for item in items:
            product_id = int(item.get("id"))
            quantity = int(item.get("quantity", 1))

            if quantity <= 0:
                raise ValueError("Սխալ քանակ")

            product = conn.execute(
                "SELECT * FROM products WHERE id = ?",
                (product_id,)
            ).fetchone()

            if product is None:
                raise ValueError("Ապրանքը չի գտնվել")

            if product["stock"] < quantity:
                raise ValueError(
                    f"«{product['name']}» ապրանքը բավարար քանակով առկա չէ"
                )

            subtotal = product["price"] * quantity
            total += subtotal

            final_items.append({
                "id": product["id"],
                "name": product["name"],
                "price": product["price"],
                "quantity": quantity,
                "image": product["image"],
                "subtotal": subtotal
            })

        cursor = conn.execute("""
            INSERT INTO orders
            (customer_name, phone, address, comment, items,
             total, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            name,
            phone,
            address,
            comment,
            json.dumps(final_items, ensure_ascii=False),
            total,
            "Նոր",
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))

        for item in final_items:
            conn.execute("""
                UPDATE products
                SET stock = stock - ?
                WHERE id = ?
            """, (
                item["quantity"],
                item["id"]
            ))

        conn.commit()

        return jsonify({
            "success": True,
            "message": "Պատվերը գրանցվեց",
            "order_id": cursor.lastrowid,
            "total": total
        }), 201

    except ValueError as e:
        conn.rollback()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400

    except Exception as e:
        conn.rollback()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        conn.close()


@app.route("/api/orders/<int:order_id>", methods=["PUT"])
def change_order_status(order_id):
    data = request.get_json(silent=True) or {}
    status = str(data.get("status", "")).strip()

    allowed = [
        "Նոր",
        "Հաստատված",
        "Պատրաստվում է",
        "Առաքվում է",
        "Ավարտված",
        "Չեղարկված"
    ]

    if status not in allowed:
        return jsonify({
            "success": False,
            "message": "Անվավեր կարգավիճակ"
        }), 400

    conn = db()

    order = conn.execute(
        "SELECT * FROM orders WHERE id = ?",
        (order_id,)
    ).fetchone()

    if order is None:
        conn.close()
        return jsonify({
            "success": False,
            "message": "Պատվերը չի գտնվել"
        }), 404

    old_status = order["status"]

    try:
        items = json.loads(order["items"] or "[]")
    except Exception:
        items = []

    try:
        if old_status != "Չեղարկված" and status == "Չեղարկված":
            for item in items:
                conn.execute("""
                    UPDATE products
                    SET stock = stock + ?
                    WHERE id = ?
                """, (
                    int(item.get("quantity", 0)),
                    int(item.get("id"))
                ))

        elif old_status == "Չեղարկված" and status != "Չեղարկված":
            for item in items:
                product = conn.execute(
                    "SELECT * FROM products WHERE id = ?",
                    (int(item.get("id")),)
                ).fetchone()

                if product is None:
                    raise ValueError("Պատվերի ապրանքը այլևս չկա")

                if product["stock"] < int(item.get("quantity", 0)):
                    raise ValueError(
                        f"«{product['name']}» ապրանքը բավարար քանակով առկա չէ"
                    )

            for item in items:
                conn.execute("""
                    UPDATE products
                    SET stock = stock - ?
                    WHERE id = ?
                """, (
                    int(item.get("quantity", 0)),
                    int(item.get("id"))
                ))

        conn.execute(
            "UPDATE orders SET status = ? WHERE id = ?",
            (status, order_id)
        )

        conn.commit()

        return jsonify({
            "success": True,
            "message": "Կարգավիճակը փոխվեց"
        })

    except ValueError as e:
        conn.rollback()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400

    except Exception as e:
        conn.rollback()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        conn.close()


# =========================================================
# ADMIN STATS & HEALTH
# =========================================================

@app.route("/api/stats")
def stats_api():
    conn = db()

    products = conn.execute(
        "SELECT COUNT(*) AS c FROM products"
    ).fetchone()["c"]

    orders = conn.execute(
        "SELECT COUNT(*) AS c FROM orders"
    ).fetchone()["c"]

    pending = conn.execute("""
        SELECT COUNT(*) AS c
        FROM orders
        WHERE status IN
        ('Նոր', 'Հաստատված', 'Պատրաստվում է', 'Առաքվում է')
    """).fetchone()["c"]

    revenue = conn.execute("""
        SELECT COALESCE(SUM(total), 0) AS total
        FROM orders
        WHERE status = 'Ավարտված'
    """).fetchone()["total"]

    low_stock = conn.execute("""
        SELECT COUNT(*) AS c
        FROM products
        WHERE stock <= 3
    """).fetchone()["c"]

    conn.close()

    return jsonify({
        "products": products,
        "orders": orders,
        "pending": pending,
        "revenue": revenue,
        "low_stock": low_stock
    })


@app.route("/api/health")
def health():
    conn = db()
    product_count = conn.execute(
        "SELECT COUNT(*) AS c FROM products"
    ).fetchone()["c"]
    conn.close()

    return jsonify({
        "status": "ok",
        "product_count": product_count
    })


# =========================================================
# RUN APPLICATION
# =========================================================

if __name__ == "__main__":
    prepare_database()
    app.run(host='0.0.0.0', port=5000, debug=True)