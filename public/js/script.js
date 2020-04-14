(function () {
    // console.log("Sanity check");

    Vue.component('my-first-component', {
        template: '#my-component',
        props: ['id'],
        data: function () {
            return {
                images: {
                    title: "",
                    description: "",
                    url: "",
                    username: "",
                    created_at: "",
                },
                comment: '',
                username: '',
                comments: []

            };
        },
        watch: {
            id: function () {
                console.log("the id has changed:", this.id);
                this.getData();
            }
        },
        mounted: function () {
            console.log("this.id: ", this.id);
            var me = this;
            axios.get(`/images/${me.id}`)
                .then(function (response) {
                    // console.log("response in get images: ", response);
                    me.images = response.data[0]
                    // console.log("me.image: ", me.image);

                }).catch(error => {
                    this.handleMessage()
                    console.log("Error in get/images: ", error)
                });

            axios.get(`/comments/${me.id}`)
                .then(function (response) {
                    console.log("Me comments")
                    me.comments = response.data.comments;
                    me.comments.forEach(comment => {
                        let date = new Date(comment.created_at)
                        comment.created_at = date.toLocaleString()
                    })
                }).catch(error => console.log("Error in get/comments: : ", error));

        },
        methods: {
            handleMessage: function () {
                console.log('clicked on X');
                this.$emit('message');
            },

            handleClick: function () {
                this.$emit('message') //NOT CAMEL CASE
                console.log("clicked!");

            },
            submitComments: function (e) {
                e.preventDefault();
                // console.log("TEST")
                // console.log(this)
                var me = this;
                // console.log("inside submit comments: ", this.username, this.comment, this.id);

                axios.post(`/comments`, {
                    comment: this.comment,
                    username: this.username,
                    image_id: this.id
                }).then(function (response) {
                    me.comments.unshift(response.data.comment);
                })
                    .catch(error => console.log("Error in post/comments: : ", error));
            }
        }
    });

    /// VUE INSTANCE ///
    new Vue({
        el: '#main',
        data: {
            id: location.hash.slice(1),
            images: [],
            title: "",
            description: "",
            username: "",
            file: null,
            more: true
        },
        mounted: function () {
            console.log("My Vue Component has mounted!");
            // console.log("this.images", this.images);
            var me = this;

            axios.get('/images')
                .then(function (response) {
                    console.log("response get images VUE INSTANCE: ", response);

                    me.images = response.data.rows;

                    window.addEventListener("hashchange", function () {
                        var hashId = location.hash.slice(1);

                        for (var i = 0; i < me.images.length; i++) {
                            if (hashId == me.images[i].id) {
                                me.id = hashId;
                                return;
                            }
                        }
                        me.handleMessage();
                        return;
                    });

                })
                .catch(error => console.log(error));
        },

        methods: {
            handleClick: function (e) {
                e.preventDefault();
                console.log("this!: ", this);

                var formData = new FormData();
                formData.append('title', this.title);
                formData.append('description', this.description);
                formData.append('username', this.username);
                formData.append('file', this.file);
                var me = this;

                axios.post('/upload', formData)
                    .then(function (resp) {
                        console.log("resp from POST /upload: ", resp);
                        let image = resp.data.image

                        me.images.unshift(image);
                    })
                    .catch(error => console.log("Error in POST /upload", error)
                    );
            },
            handleChange: function (e) {
                console.log("handle change is running");
                console.log("file: ", e.target.files[0]);
                this.file = e.target.files[0];

            },
            handleMessage: function () {
                console.log("message received in Vue INSTANCE!");
                this.id = null;
                location.hash = ""

            },
            selectImg: function (id) {
                this.id = id;
                console.log("image was clicked, id: ", id);
            },
            getMoreImages: function () {
                let lastId = this.images[this.images.length - 1].id

                console.log(lastId)

                let me = this

                axios.post('/moreImages', {
                    lastId
                }
                )
                    .then(function (resp) {
                        console.log("resp more images ");
                        // console.log(resp.data)
                        console.log(resp.data.images.length)
                        if (resp.data.images.length < 8) {
                            me.more = false
                        }
                        me.images = me.images.concat(resp.data.images);

                    })
                    .catch(error => console.log("Error in POST /upload", error)
                    );
            }
        }
    });
})();



