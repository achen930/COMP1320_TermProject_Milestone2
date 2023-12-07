const fs = require("fs/promises");
const { DEFAULT_HEADER } = require("./util/util");
const path = require("path");
var qs = require("querystring");
const { formidable } = require("formidable");
const ejs = require("ejs");


const readDatabase = async (filePath) => {
    try {
        const database = await fs.readFile("../database/data.json", "utf8");
        return JSON.parse(database);
    } catch (error) {
        console.log(`Error reading database: ${error.message}`);
        throw error;
    }
};

const writeDatabase = async (filePath, data) => {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing to database: ${error.message}`);
        throw error;
    }
};

const controller = {

    getHomePage: async (request, response) => {
        // construct HTML based on info from usersArray
        try {
            const databaseFilePath = "../database/data.json";
            const usersArray = await readDatabase(databaseFilePath);

            const homepageEJS = await fs.readFile("./homepage.ejs", "utf8");
            const render = ejs.render(homepageEJS, { users: usersArray });
            
            response.end(render);
        } catch (error) {
            console.log(`Error in getHomePage: ${error.message}`);
            response.writeHead(500, "Internal Server Error" );
        }
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
    const currentUser = qs.parse(usernameArray[1]);

    const database = await fs.readFile("../database/data.json", "utf8");
    const usersArray = JSON.parse(database);

    let userObj = usersArray.filter((user) => user.username === currentUser.username);
    console.log(userObj);

    const feedEJS = await fs.readFile("./feed.ejs", "utf8");
    const render = ejs.render(feedEJS, { user: userObj[0] });
    
    response.end(render);

  },
  uploadImages: async (request, response) => {
        // parse a file upload
        const form = formidable({});
        let fields;
        let files;
        let currentUser;
        let originalFilename;
        try {
            form.on("fileBegin", (formname, file) => {
                console.log(formname)
                console.log(file.originalFilename)
                console.log(file.filepath)
                currentUser = formname;
                originalFilename = file.originalFilename;
                file.filepath = `./photos/${formname}/${file.originalFilename}`;
                console.log(file.filepath)
            });
            form.on("end", async () => {
                // add filename to database
                try {
                    let databaseFilePath = "../database/data.json";
                    const usersArray = await readDatabase(databaseFilePath);
                    const username = currentUser;
                    const user = usersArray.find(u => u.username === username);
            
                    if (user) {
                        // Add the filename to the user's array of photos
                        user.photos.push(originalFilename);
                        user.stats.posts++;
                        await writeDatabase(databaseFilePath, usersArray);
            
                        response.writeHead(302, { "Location": `/` });
                        return;
                    } else {
                        // User not found
                        response.writeHead(404, { "Content-Type": "application/json" });
                        response.end(JSON.stringify({ error: "User not found." }));
                    }
                } catch (error) {
                    console.error(`Error handling form end: ${error.message}`);
                    response.writeHead(500, { "Content-Type": "application/json" });
                    response.end(JSON.stringify({ error: "Internal Server Error" }));
                }
            });
            [fields, files] = await form.parse(request);
        } catch (err) {
            console.error(err);
            response.writeHead(err.httpCode || 400, { "Content-Type": "text/plain" });
            response.end(String(err));
            return;
        }
  }
};

module.exports = controller;