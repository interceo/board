CREATE TABLE board (
    name varchar(255) PRIMARY KEY
);

CREATE TABLE board_counter (
    board_name varchar(255) PRIMARY KEY REFERENCES board(name),
    next_post_number BIGINT NOT NULL DEFAULT 1
);

CREATE TABLE post (
    id BIGSERIAL PRIMARY KEY,
    fk_board_name VARCHAR(255) REFERENCES board(name) NOT NULL,
    post_number BIGINT NOT NULL,  -- общий сквозной номер на доске
    parent_id BIGINT REFERENCES post(id), -- NULL если это сам thread
    created_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT,
    subtitle TEXT,
    -- другие поля
    UNIQUE (fk_board_name, post_number)
);

CREATE OR REPLACE FUNCTION increment_post_number()
RETURNS TRIGGER AS $$
DECLARE
    next_id BIGINT;
BEGIN
    UPDATE board_counter
    SET next_post_number = next_post_number + 1
    WHERE board_name = NEW.fk_board_name
    RETURNING next_post_number - 1 INTO next_id;

    IF NOT FOUND THEN
        INSERT INTO board_counter(board_name, next_post_number) VALUES (NEW.fk_board_name, 2);
        next_id := 1;
    END IF;
    NEW.post_number := next_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_insert_trigger
BEFORE INSERT ON post
FOR EACH ROW
EXECUTE FUNCTION increment_post_number();