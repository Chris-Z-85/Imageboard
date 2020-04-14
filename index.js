const express = require('express');
const app = express();
const { getImages,
    uploadImages,
    getModalData,
    getComments,
    addComment,
    getMoreImages } = require('./db');

/// FILE UPLOAD BOILERPLATE CODE ///
const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');
const s3 = require("./s3");
const { s3Url } = require("./config");

app.use(express.json());

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});
/// BOILERPLATE CODE ///

app.use(express.static('./public'));

app.get('/images', (req, res) => {

    getImages()
        .then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
        });
});

app.post('/upload', uploader.single('file'), s3.upload, (req, res) => {
    console.log("input: ", req.body);
    console.log("file: ", req.file);

    if (req.file) {
        let { username, title, description } = req.body;
        let url = s3Url + req.file.filename;


        uploadImages(url, username, title, description)
            .then(function (result) {
                console.log(result.rows);
                res.json({ image: result.rows[0] });
            }).catch(error => { console.log("error in uploadImages:", error); });

    } else {
        res.json({
            success: false
        });
    }

});


app.get('/images/:id', (req, res) => {
    getModalData(req.params.id)
        .then(result => {
            res.json(result.rows);
            console.log("result of getModalData: ", result.rows);
        }).catch(error => { console.log("error in getModalData: ", error); });
});

app.get("/comments/:id", (req, res) => {
    getComments(req.params.id)
        .then(result => {
            console.log("result of getComments: ", result);
            res.json({ comments: result.rows });
        }).catch(error => { console.log("error in getComments: ", error); });
});

app.post("/comments", (req, res) => {
    console.log("req.body in post/comments: ", req.body);
    const { comment, username, image_id } = req.body;
    addComment(comment, username, image_id)
        .then((result) => {
            console.log("addComment completed");
            res.json({ comment: result.rows[0] });
        })
        .catch(error => {
            console.log("error in addComment:", error);
        });
});

app.post("/moreImages", (req, res) => {
    console.log(req.body);
    let lastId = req.body.lastId;
    console.log("lastId: " + lastId);
    getMoreImages(lastId)
        .then((result) => {
            res.json({ images: result.rows });
        })
        .catch(error => {
            console.log("error in addComment:", error);
        });
});


app.listen(8080, () => console.log("Imageboard is listening!"));
