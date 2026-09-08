import os


BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


DATABASE = os.path.join(
    BASE_DIR,
    "furniture.db"
)


SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "tevosyan-furniture-secret-key-2026"
)