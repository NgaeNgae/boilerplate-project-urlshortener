require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const url = require("url");
const fs = require("fs");
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

function dataManagement(action, input) {
  let filepath = "./public/data.json";
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify([], null, 2));
  }
  let file = fs.readFileSync(filepath);
  let data = JSON.parse(file);
  if (action === "add") {
    let add = {
        original_url : input,
        short_url : data.length + 1,
      }
    data.push(add);
     fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    return add;
  } else {
    return data;
  }
}

app.post("/api/shorturl", function (req, res) {
  let input = req.body.url;
  dns.lookup(url.parse(input).hostname, async (err, address) => {
    if (!address) {
      res.json({ error: "Invalid URL" });
    } else {
      let data = dataManagement("add", input);
      res.json({
        original_url: data.original_url,
        short_url: data.short_url,
      });
    }
  });
});
app.get("/api/shorturl/:shorturl", (req, res) => {
  let input = Number(req.params.shorturl);
  console.log(input);
  let all_data = dataManagement("get");
  let short = all_data.map(d => d.short_url);
  let data = short.includes(input);
  if (data) {
    data_found = all_data[short.indexOf(input)];
    res.redirect(data_found.original_url);
  } else {
    res.json({ data: "No matching data", short: input });
  }
});
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
