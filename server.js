import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import querystring from "node:querystring";

const PORT = 3000;
const mimeTypes = {
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jfif": "image/jfif",
};

const dirname = path.dirname(process.argv[1]);

function getStaticFile(res, filePath, ext) {
  res.setHeader("Content-Type", mimeTypes[ext]);
  const fullPath =  path.join(dirname, "public", filePath)
  fs.readFile(
    fullPath,
    (err, data) => {
      if (err) {
        res.writeHead(404);
        console.log(fullPath)
      } else {
        res.writeHead(200);
        res.write(data);
      }
      res.end();
    }
  );
}

const server = http.createServer((req, res) => {
  console.log(req.url, req.method);
  const url = req.url;
  switch (url) {
    case "/":
      {
        if (req.method === "GET") {
          fs.readFile(
            path.join(dirname, "public", "pages", "index.html"),
            (err, data) => {
              if (err) {
                res.writeHead(500);
              } else {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.write(data);
              }
              res.end();
            }
          );
        } else if (req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk.toString();
            console.log(body+ " +");
          });

          req.on("end", () => {
            const parsedData = querystring.parse(body);
          
            fs.appendFile(path.join(dirname, "public", "server", "storage.json"),
            JSON.stringify(parsedData) + ",\n",
            (err) => {
            if (err) {
                console.error(err);
                res.end();
            }
            else{  
              res.writeHead(303, {Location: "/"});
              res.end();
            }
            });

          });

          
          
        }
      }

      break;
    case "/contacts":
      fs.readFile(
        path.join(dirname, "public", "pages", "contacts.html"),
        (err, data) => {
          if (err) {
            res.writeHead(500);
          } else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.write(data);
          }
          res.end();
        }
      );
      break;
    default:
      const extname = path.extname(url).toLocaleLowerCase();
      if (extname in mimeTypes) {
        getStaticFile(res, url, extname);
      } else {
        res.writeHead(404);
        res.end();
      }
  }
});

server.listen(PORT, () => {
  console.log(`Server is running http://localhost:${PORT} ...`);
});