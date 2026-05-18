"""Initialize the database with pgvector extension and tables."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import init_db


def main():
    print("Initializing database with pgvector...")
    init_db()
    print("Done!")


if __name__ == "__main__":
    main()
