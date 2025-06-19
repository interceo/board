import psycopg2
from psycopg2.extras import execute_batch
import random
import string


DB_CONFIG = {
    "dbname": "imageboard",
    "user": "imageboard_user",
    "password": "password",
    "host": "127.0.0.1",
    "port": 5432,
}


BOARD_NAME = "test"
NUM_THREADS = 100        # сколько тредов создать
POSTS_PER_THREAD = 100   # сколько постов в каждом треде

def random_title():
    return "Тестовый тред " + ''.join(random.choices(string.ascii_letters, k=5))

def random_post():
    return "Пост: " + ''.join(random.choices(string.ascii_letters + string.digits, k=10))

def main():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    # Создаём тестовую доску если нет
    cur.execute("INSERT INTO board (name) VALUES (%s) ON CONFLICT DO NOTHING", (BOARD_NAME,))

    thread_ids = []
    # 1. Создаём треды (post с parent_id NULL)
    for i in range(NUM_THREADS):
        cur.execute(
            "INSERT INTO post (fk_board_name, parent_id, title) VALUES (%s, %s, %s) RETURNING id",
            (BOARD_NAME, None, random_title())
        )
        thread_id = cur.fetchone()[0]
        thread_ids.append(thread_id)

    conn.commit()  # фиксируем треды

    # 2. Массово создаём посты-ответы
    posts = []
    for thread_id in thread_ids:
        for j in range(POSTS_PER_THREAD):
            posts.append((BOARD_NAME, thread_id, random_post()))

    execute_batch(
        cur,
        "INSERT INTO post (fk_board_name, parent_id, title) VALUES (%s, %s, %s)",
        posts,
        page_size=1000
    )
    conn.commit()
    print(f"Создано {NUM_THREADS} тредов и {len(posts)} постов.")
    cur.close()
    conn.close()

if __name__ == "__main__":
    main()