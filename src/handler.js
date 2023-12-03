const { parse } = require("url");
const { DEFAULT_HEADER } = require("./util/util.js");
const controller = require("./controller");
const { createReadStream } = require("fs");
const path = require("path");

const allRoutes = {
  // POST
  "/api/upload": (request, response) => {
    controller.uploadImages(request, response);
  },
  // GET: localhost:3000/
  "/:get": (request, response) => {
    controller.getHomePage(request, response);
  },
  "/photos:get": (request, response) => {
    controller.getImage(request, response);
  },
  // POST: localhost:3000/
  "/:post": (request, response) => {
    controller.sendFormData(request, response);
  },
  // POST: localhost:3000/images
  "/images:post": (request, response) => {
    controller.uploadImages(request, response);
  },
  // GET: localhost:3000/feed
  // Shows instagram profile for a given user
  "/feed:get": (request, response) => {
    controller.getFeed(request, response);
  },

  // 404 routes
  default: (request, response) => {
    response.writeHead(404, DEFAULT_HEADER);
    createReadStream(path.join(__dirname, "views", "404.html"), "utf8").pipe(
      response
    );
  },
};

function handler(request, response) {
  const { url, method } = request;

  const { pathname } = parse(url, true);

  const urlSplitArray = request.url.split("/")
  const user = urlSplitArray[2];
  
  let mimetype = "";
  if (path.extname(pathname) === ".jpeg" || path.extname(pathname) === ".png") {
    if (path.extname(pathname) === ".jpeg") {
      mimetype = "image/jpeg";
    } else {
      mimetype = "image/png";
    }
    
    response.writeHead(200, {"Content-Type": mimetype});

    const directoryPath = `./photos/${user}/`;

    // Create read stream based on user and file extension
    const filePath = path.join(directoryPath, path.basename(pathname));
    return Promise.resolve(createReadStream(filePath).pipe(response));
  }

  const key = `${pathname}:${method.toLowerCase()}`;
  const chosen = allRoutes[key] || allRoutes.default;

  return Promise.resolve(chosen(request, response)).catch(
    handlerError(response)
  );
}

function handlerError(response) {
  return (error) => {
    console.log("Something bad has  happened**", error.stack);
    response.writeHead(500, DEFAULT_HEADER);
    response.write(
      JSON.stringify({
        error: "internet server error!!",
      })
    );

    return response.end();
  };
}

module.exports = handler;
