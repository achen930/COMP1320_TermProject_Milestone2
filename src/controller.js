const fs = require("fs/promises");
const { DEFAULT_HEADER } = require("./util/util");
const path = require("path");
var qs = require("querystring");
const { formidable } = require("formidable");

const controller = {
  getHomePage: async (request, response) => {
    const database = await fs.readFile("../database/data.json", "utf8");
    const usersArray = JSON.parse(database);
    // construct HTML based on info from usersArray
    let userCard = "";
    console.log(usersArray)
    
    usersArray.forEach((user) => {
        let usernameCurrent = "";
        usernameCurrent = user.username;
        userCard += `
            <div>
                <img src="/photos/${usernameCurrent}/profile.jpeg" alt="Profile Photo for ${usernameCurrent}">
                <form action="/images" method="POST" enctype="multipart/form-data" id="${usernameCurrent}">
                    <input type="file" id="selectedFile_${usernameCurrent}" name="${usernameCurrent}" style="display: none;" onchange="this.form.submit();" />
                    <input type="button" value="Upload" onclick="document.getElementById('selectedFile_${usernameCurrent}').click();"/>
                </form>
                <form action="/feed" method="GET">
                    <input type="submit" name="username" value="${usernameCurrent}">
                </form>
            </div>
        `;
    });
    
    response.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Home</title>
          </head>
          <body>
          <style>
            body {
                font-family: "Open Sans", Arial, sans-serif;
            }
            html {
                background-color: #FAF9F6;
                z-index: -1;
            }
            body {
                margin: 50px;
            }
            div {
                background-color: white;
                width: 250px;
                height: 80px;
                padding: 10px;
                border-radius: 3%;
                margin-bottom: 20px;
            }
            input {
                width: 140px;
                text-align: center;
                font-size: 1.1rem;
                line-height: 1.6;
                border: 0.1rem solid #dbdbdb;
                border-radius: 0.3rem;
                padding: 0 20px;
                margin: 0.1rem 10px 0 0;
                position: relative;
                left: 100px;
                bottom: 75px;
            }
            img {
                border-radius: 50%;
                width: 80px;
                height: 80px;
            }
          </style>
          <h1>Users</h1>
          ${userCard}
        </body>
      </html>
    `);
  },
  sendFormData: (request, response) => {
    var body = "";

    request.on("data", function (data) {
      body += data;
    });

    request.on("end", function () {
      var post = qs.parse(body);
      console.log(post);
    });
  },

  getFeed: async (request, response) => {
    // console.log(request.url); try: http://localhost:3000/feed?username=john123
    const usernameArray = request.url.split("?");
    const user = qs.parse(usernameArray[1]);
    const database = await fs.readFile("../database/data.json", "utf8");
    const usersArray = JSON.parse(database);
    
    let userBio = "";
    let stats = "";
    let galleryItems = "";

    const requestedUsername = user.username;

    usersArray.forEach((user) => {
        let usernameCurrent = user.username;

        // Check if the current user matches the requested user
        if (usernameCurrent === requestedUsername) {
            const baseDirectory = "./photos/";

            user.photos.forEach((photo, index) => {
                const photoPath = path.join(baseDirectory, usernameCurrent, photo);

                galleryItems += `
                    <div class="gallery-item" tabindex="${index + 1}">
                        <img src="${photoPath}" class="gallery-image" alt="">
                        <div class="gallery-item-info">
                            <ul>
                                <li class="gallery-item-likes"><span class="visually-hidden">Likes:</span><i class="fas fa-heart" aria-hidden="true"></i> 0</li>
                                <li class="gallery-item-comments"><span class="visually-hidden">Comments:</span><i class="fas fa-comment" aria-hidden="true"></i> 0</li>
                            </ul>
                        </div>
                    </div>
                `;
            });

            userBio = user.description;
            stats = user.stats;

            return;
        }
    });

    response.write(`
    <html>
    <head>
    <meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600"><link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.2.0/css/all.css">
    <style>

    /* Base Styles */

    :root {
        font-size: 10px;
    }

    *,
    *::before,
    *::after {
        box-sizing: border-box;
    }

    body {
        font-family: "Open Sans", Arial, sans-serif;
        min-height: 100vh;
        background-color: #fafafa;
        color: #262626;
        padding-bottom: 3rem;
    }

    img {
        display: block;
    }

    .container {
        max-width: 93.5rem;
        margin: 0 auto;
        padding: 0 2rem;
    }

    .btn {
        display: inline-block;
        font: inherit;
        background: none;
        border: none;
        color: inherit;
        padding: 0;
        cursor: pointer;
    }

    .btn:focus {
        outline: 0.5rem auto #4d90fe;
    }

    .visually-hidden {
        position: absolute !important;
        height: 1px;
        width: 1px;
        overflow: hidden;
        clip: rect(1px, 1px, 1px, 1px);
    }

    /* Profile Section */

    .profile {
        padding: 5rem 0;
    }

    .profile::after {
        content: "";
        display: block;
        clear: both;
    }

    .profile-image {
        float: left;
        width: calc(33.333% - 1rem);
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 3rem;
    }

    .profile-image img {
        border-radius: 50%;
    }

    .profile-user-settings,
    .profile-stats,
    .profile-bio {
        float: left;
        width: calc(66.666% - 2rem);
    }

    .profile-user-settings {
        margin-top: 1.1rem;
    }

    .profile-user-name {
        display: inline-block;
        font-size: 3.2rem;
        font-weight: 300;
    }

    .profile-edit-btn {
        font-size: 1.4rem;
        line-height: 1.8;
        border: 0.1rem solid #dbdbdb;
        border-radius: 0.3rem;
        padding: 0 2.4rem;
        margin-left: 2rem;
    }

    .profile-settings-btn {
        font-size: 2rem;
        margin-left: 1rem;
    }

    .profile-stats {
        margin-top: 2.3rem;
    }

    .profile-stats li {
        display: inline-block;
        font-size: 1.6rem;
        line-height: 1.5;
        margin-right: 4rem;
        cursor: pointer;
    }

    .profile-stats li:last-of-type {
        margin-right: 0;
    }

    .profile-bio {
        font-size: 1.6rem;
        font-weight: 400;
        line-height: 1.5;
        margin-top: 2.3rem;
    }

    .profile-real-name,
    .profile-stat-count,
    .profile-edit-btn {
        font-weight: 600;
    }

    /* Gallery Section */

    .gallery {
        display: flex;
        flex-wrap: wrap;
        margin: -1rem -1rem;
        padding-bottom: 3rem;
    }

    .gallery-item {
        position: relative;
        flex: 1 0 22rem;
        margin: 1rem;
        color: #fff;
        cursor: pointer;
    }

    .gallery-item:hover .gallery-item-info,
    .gallery-item:focus .gallery-item-info {
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3);
    }

    .gallery-item-info {
        display: none;
    }

    .gallery-item-info li {
        display: inline-block;
        font-size: 1.7rem;
        font-weight: 600;
    }

    .gallery-item-likes {
        margin-right: 2.2rem;
    }

    .gallery-item-type {
        position: absolute;
        top: 1rem;
        right: 1rem;
        font-size: 2.5rem;
        text-shadow: 0.2rem 0.2rem 0.2rem rgba(0, 0, 0, 0.1);
    }

    .fa-clone,
    .fa-comment {
        transform: rotateY(180deg);
    }

    .gallery-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    /* Loader */

    .loader {
        width: 5rem;
        height: 5rem;
        border: 0.6rem solid #999;
        border-bottom-color: transparent;
        border-radius: 50%;
        margin: 0 auto;
        animation: loader 500ms linear infinite;
    }
    .profile-image img {
        width:152px;
    }
    /* Media Query */

    @media screen and (max-width: 40rem) {
        .profile {
            display: flex;
            flex-wrap: wrap;
            padding: 4rem 0;
        }

        .profile::after {
            display: none;
        }

        .profile-image,
        .profile-user-settings,
        .profile-bio,
        .profile-stats {
            float: none;
            width: auto;
        }

        .profile-image img {
            width: 7.7rem;
        }

        .profile-user-settings {
            flex-basis: calc(100% - 10.7rem);
            display: flex;
            flex-wrap: wrap;
            margin-top: 1rem;
        }

        .profile-user-name {
            font-size: 2.2rem;
        }

        .profile-edit-btn {
            order: 1;
            padding: 0;
            text-align: center;
            margin-top: 1rem;
        }

        .profile-edit-btn {
            margin-left: 0;
        }

        .profile-bio {
            font-size: 1.4rem;
            margin-top: 1.5rem;
        }

        .profile-edit-btn,
        .profile-bio,
        .profile-stats {
            flex-basis: 100%;
        }

        .profile-stats {
            order: 1;
            margin-top: 1.5rem;
        }

        .profile-stats ul {
            display: flex;
            text-align: center;
            padding: 1.2rem 0;
            border-top: 0.1rem solid #dadada;
            border-bottom: 0.1rem solid #dadada;
        }

        .profile-stats li {
            font-size: 1.4rem;
            flex: 1;
            margin: 0;
        }

        .profile-stat-count {
            display: block;
        }
    }

    /* Spinner Animation */

    @keyframes loader {
        to {
            transform: rotate(360deg);
        }
    }

    @supports (display: grid) {
        .profile {
            display: grid;
            grid-template-columns: 1fr 2fr;
            grid-template-rows: repeat(3, auto);
            grid-column-gap: 3rem;
            align-items: center;
        }

        .profile-image {
            grid-row: 1 / -1;
        }

        .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(22rem, 1fr));
            grid-gap: 2rem;
        }

        .profile-image,
        .profile-user-settings,
        .profile-stats,
        .profile-bio,
        .gallery-item,
        .gallery {
            width: auto;
            margin: 0;
        }

        @media (max-width: 40rem) {
            .profile {
                grid-template-columns: auto 1fr;
                grid-row-gap: 1.5rem;
            }

            .profile-image {
                grid-row: 1 / 2;
            }

            .profile-user-settings {
                display: grid;
                grid-template-columns: auto 1fr;
                grid-gap: 1rem;
            }

            .profile-edit-btn,
            .profile-stats,
            .profile-bio {
                grid-column: 1 / -1;
            }

            .profile-user-settings,
            .profile-edit-btn,
            .profile-settings-btn,
            .profile-bio,
            .profile-stats {
                margin: 0;
            }
        }
    }
    </style>

    </head>
    <body>
    <header>

	<div class="container">

		<div class="profile">

			<div class="profile-image">

				<img src="/photos/${user.username}/profile.jpeg" alt="Profile Photo for ${user.username}">

			</div>

			<div class="profile-user-settings">

				<h1 class="profile-user-name">${user.username}</h1>

				<button class="btn profile-edit-btn">Edit Profile</button>

				<button class="btn profile-settings-btn" aria-label="profile settings"><i class="fas fa-cog" aria-hidden="true"></i></button>

			</div>

			<div class="profile-stats">

				<ul>
					<li><span class="profile-stat-count">${stats.posts}</span> posts</li>
					<li><span class="profile-stat-count">${stats.followers}</span> followers</li>
					<li><span class="profile-stat-count">${stats.following}</span> following</li>
				</ul>

			</div>

			<div class="profile-bio">

				<p><span class="profile-real-name">${user.username}</span> ${userBio}</p>

			</div>

		</div>
		<!-- End of profile section -->

	</div>
	<!-- End of container -->

</header>

<main>

<div class="container">
<div class="gallery">
    ${galleryItems}
</div>
</div>
		<!-- End of gallery -->

		<div class="loader"></div>

	</div>
	<!-- End of container -->

</main>
</body>
</html>
    `);
    response.end();
  },
  uploadImages: async (request, response) => {
        // parse a file upload
        const form = formidable({});
        let fields;
        let files;
        let currentUser;
        let pngCount = 0;
        try {
            form.on("fileBegin", (formname, file) => {
                console.log(formname)
                console.log("hi");
                console.log(file.originalFilename)
                console.log(file.filepath)
                file.filepath = `./photos/${formname}/${file.originalFilename}`;
                console.log(file.filepath)
                //form.emit("data", { name: "fileBegin", formname, value: file });
            });
            [fields, files] = await form.parse(request);
        } catch (err) {
            // example to check for a very specific error
            // if (err.code === formidableErrors.maxFieldsExceeded) {
    
            // }
            console.error(err);
            response.writeHead(err.httpCode || 400, { "Content-Type": "text/plain" });
            response.end(String(err));
            return;
        }
        
        // const filePromises = Object.values(files).map(async(file) => {
        //     const oldPath = file.path;
        //     const fileExt = path.extname(file.name);
        //     pngCount++;
        //     const newFileName = `pic${pngCount}${fileExt}`;
        //     const newPath = path.join(__dirname, "uploads", newFileName);

        //     try {
        //         await fs.rename(oldPath, newPath);
        //     } catch (renameError) {
        //         console.log(renameError);
        //         response.writeHead(500, { "Content-Type": "text/plain" });
        //         response.end("Internal Server Error");
        //         return;
        //     }
        //     return newFileName;
        // });

        // try {
        //     const newFileNames = await Promise.all(filePromises);
        //     response.writeHead(200, { "Content-Type": "application/json" });
        //     response.end(JSON.stringify({ fields, files }, null, 2));
        // } catch (error) {
        //     console.log(error);
        //     response.writeHead(500, { "Content-Type": "text/plain" });
        //     response.end("Internal Server Error");
        // }
        // return;
  }
};

module.exports = controller;
