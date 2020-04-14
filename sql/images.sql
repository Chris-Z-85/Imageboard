DROP TABLE IF EXISTS images;

CREATE TABLE images
(
    id SERIAL PRIMARY KEY,
    url VARCHAR NOT NULL,
    username VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments
(
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    comment VARCHAR(255) NOT NULL,
    image_id INT NOT NULL references images(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);