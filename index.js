require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const urlparser = require("url");
const dns = require("dns");

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

//vvvvvvvvvvvvvMongoose CONFIGvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
const mongoose = require("mongoose");
// Database connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("COnectado a mi DB"));

// Url model
const Url = mongoose.model("Ulr", {
  url: { type: String },
});
//^^^^^^^^^^^^Mongoose CONFIG^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

//***MIDLEWARES***
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//referencia a la carpeta public
app.use("/public", express.static(`${process.cwd()}/public`));

//****ROUTES****
//defaul
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//Envia la shortner
app.post("/api/shorturl/", function (req, res) {
  const bodyurl = req.body.url; //guarda lo recibido del index.html
  //verifica si existe dominio dnslookup
  const dnslookup = dns.lookup(
    urlparser.parse(bodyurl).hostname,
    async (err, address) => {
      if (!address) {
        res.json({ error: "invalid url" });
      } else {
        //pasando dato a la bd
        const url = new Url({ url: bodyurl });
        url.save((err, data) => {
          //mostrando en pantalla
          res.json({
            original_url: data.url,
            short_url: data.id,
          });
        });
        //res.json({ error: "URL valid" });
      }
    }
  );
});

//Redirige al dominio acortado dado un id
app.get("/api/shorturl/:id", (req, res) => {
  const id = req.params.id;
  Url.findById(id, (err, data) => {
    if (!data) {
      res.json({ error: "invalid url" });
    } else {
      res.redirect(data.url);
    }
  });
});

// API endpoint test
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
