document.addEventListener("DOMContentLoaded", function () {
    const video = document.querySelector("video");

    var model;
    var cameraMode = "environment"; // or "user"

    const startVideoStreamPromise = navigator.mediaDevices
        .getUserMedia({
            audio: false,
            video: {
                facingMode: cameraMode
            }
        })
        .then(function (stream) {
            return new Promise(function (resolve) {
                video.srcObject = stream;
                video.onloadeddata = function () {
                    video.play();
                    resolve();
                };
            });
        });

    var publishable_key = "rf_JQTeUT59FoZLkhJMEsRinsN4vi23";
    var toLoad = {
        model: "weapon-jmeyk",
        version: 1
    };

    const loadModelPromise = new Promise(function (resolve, reject) {
        roboflow
            .auth({
                publishable_key: publishable_key
            })
            .load(toLoad)
            .then(function (m) {
                model = m;
                resolve();
            });
    });

    Promise.all([startVideoStreamPromise, loadModelPromise]).then(function () {
        document.body.classList.remove("loading");
        resizeCanvas();
        detectFrame();
    });

    var canvas, ctx;
    const font = "16px sans-serif";

    function videoDimensions(video) {
        var videoRatio = video.videoWidth / video.videoHeight;
        var width = video.offsetWidth;
        var height = video.offsetHeight;
        var elementRatio = width / height;

        if (elementRatio > videoRatio) {
            width = height * videoRatio;
        } else {
            height = width / videoRatio;
        }

        return {
            width: width,
            height: height
        };
    }

    window.addEventListener("resize", function () {
        resizeCanvas();
    });

    const resizeCanvas = function () {
        if (canvas) {
            canvas.remove();
        }

        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
        var dimensions = videoDimensions(video);

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        canvas.style.width = dimensions.width + "px";
        canvas.style.height = dimensions.height + "px";
        canvas.style.left = (window.innerWidth - dimensions.width) / 2 + "px";
        canvas.style.top = (window.innerHeight - dimensions.height) / 2 + "px";

        document.body.appendChild(canvas);
    };

  

    const renderPredictions = function (predictions) {
        var dimensions = videoDimensions(video);
        var scale = 1;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        predictions.forEach(function (prediction) {
            const x = prediction.bbox.x;
            const y = prediction.bbox.y;
            const width = prediction.bbox.width;
            const height = prediction.bbox.height;

            ctx.strokeStyle = prediction.color;
            ctx.lineWidth = 4;
            ctx.strokeRect((x - width / 2) / scale, (y - height / 2) / scale, width / scale, height / scale);

            ctx.fillStyle = prediction.color;
            const textWidth = ctx.measureText(prediction.class).width;
            const textHeight = parseInt(font, 10);

            ctx.fillRect((x - width / 2) / scale, (y - height / 2) / scale, textWidth + 8, textHeight + 4);
        });

        predictions.forEach(function (prediction) {
            const x = prediction.bbox.x;
            const y = prediction.bbox.y;
            const width = prediction.bbox.width;
            const height = prediction.bbox.height;

            ctx.font = font;
            ctx.textBaseline = "top";
            ctx.fillStyle = "#000000";
            ctx.fillText(prediction.class, (x - width / 2) / scale + 4, (y - height / 2) / scale + 1);
            detectAndSendPredictionClass(prediction.class)
           // console.log(prediction.class);
        });

       
    };

    function detectAndSendPredictionClass(prediction) {
    
        console.log(prediction);
    
        // Make an HTTP POST request to your Express backend
        if (prediction) {
            fetch('http://localhost:3500/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prediction }),
            })
            .then(response => response.json())
            .then(data => {
                // Handle the response from the backend if needed.
            })
            .catch(error => {
                // Handle any errors that occur during the request.
            });
        }
    
        else
        {
            //dummy testing POST request
            fetch("http://localhost:5500/", {
            method: "POST",
            body: JSON.stringify({
                userId: 1,
                title: "Fix my bugs",
                completed: false
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
            });
        }
    }

    var prevTime;
    var pastFrameTimes = [];
    const detectFrame = function () {
        if (!model) return requestAnimationFrame(detectFrame);

        model
            .detect(video)
            .then(function (predictions) {
                requestAnimationFrame(detectFrame);
                renderPredictions(predictions);

                if (prevTime) {
                    pastFrameTimes.push(Date.now() - prevTime);
                    if (pastFrameTimes.length > 30) pastFrameTimes.shift();

                    var total = 0;
                    pastFrameTimes.forEach(function (t) {
                        total += t / 1000;
                    });

                    var fps = pastFrameTimes.length / total;
                    document.getElementById("fps").textContent = Math.round(fps);
                }
                prevTime = Date.now();
            })
            .catch(function (e) {
                console.log("CAUGHT", e);
                requestAnimationFrame(detectFrame);
            });
    };




});
