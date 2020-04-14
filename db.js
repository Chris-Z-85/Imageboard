const spicedPg = require('spiced-pg');

const db = spicedPg(
    `postgres://postgres:postgres@localhost:5432/imageboard`
);

exports.getImages = () => {
    return db.query(
        `SELECT * FROM images
        ORDER BY id DESC
        LIMIT 8`);
};

exports.uploadImages = (url, username, title, description) => {
    return db.query(
        `INSERT INTO images (url, username, title, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [url, username, title, description]
    );
};

exports.getModalData = function (id) {
    return db.query(
        `SELECT url, username, title, description FROM images WHERE id = $1;`,
        [id]
    );
};

exports.getComments = function (id) {
    return db.query(
        `SELECT *
        FROM comments
        WHERE image_id = $1`,
        [id]
    );
};

exports.addComment = (comment, username, image_id) => {
    return db.query(
        `INSERT INTO comments (comment, username, image_id)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [comment, username, image_id]
    );
};

exports.getMoreImages = (lastId) => {
    return db.query(
        `SELECT url, title, id, (
        SELECT id FROM images
        ORDER BY id ASC
        LIMIT 1
    ) AS "lowestId" FROM images
    WHERE id < $1
    ORDER BY id DESC
    LIMIT 8;`,
        [lastId]
    );
};