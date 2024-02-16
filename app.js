var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var port = process.env.PORT || 3000;

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var app = express();

// SDK de Mercado Pago.
const mercadopago = require("mercadopago");
// Agrega credenciales
mercadopago.configure({
  access_token:
    "APP_USR-8902774665784533-092911-fab78ca802b6475923ebb446b02fee62-1160743707",
  integrator_id: "dev_24c65fb163bf11ea96500242ac130004",
});

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(bodyParser.json());

app.use(express.static("assets"));

app.use("/assets", express.static(__dirname + "/assets"));

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/detail", function (req, res) {
  res.render("detail", req.query);
});

app.post("/payment", urlencodedParser, function (req, res) {
  // console.log("payment-req", req.body);

  let preference = {
    items: [
      {
        id: "1234",
        title: req.body.title,
        description: "Dispositivo móvil de Tienda e-commerce",
        currency_id: "COP",
        unit_price: parseFloat(req.body.price),
        picture_url: new URL(
          req.body.img,
          "https://tiendatestmp-91b440be330a.herokuapp.com/"
        ).href,
        quantity: parseInt(req.body.unit),
      },
    ],
    external_reference: "anfegabe_18@hotmail.com",
    payer: {
      name: "Lalo",
      surname: "Landa",
      email: "test_user_51300629@testuser.com",
      phone: {
        area_code: "57",
        number: 3104434567,
      },
      address: {
        street_name: "Falsa",
        street_number: 123,
        zip_code: "55411",
      },
    },
    back_urls: {
      success: "https://tiendatestmp-91b440be330a.herokuapp.com/success",
      failure: "https://tiendatestmp-91b440be330a.herokuapp.com/failure",
      pending: "https://tiendatestmp-91b440be330a.herokuapp.com/pending",
    },
    auto_return: "approved",
    notification_url:
      "https://tiendatestmp-91b440be330a.herokuapp.com/notifications?source_news=webhooks",
    payment_methods: {
      excluded_payment_methods: [
        {
          id: "visa",
        },
      ],
      excluded_payment_types: [
        {
          id: "atm",
        },
      ],
      installments: 6,
    },
    statement_descriptor: "CERTIFICACION CHO PRO MP",
  };

  mercadopago.preferences
    .create(preference)
    .then(function (response) {
      //console.log("response", response);
      // Este valor reemplazará el string "<%= global.id %>" en tu HTML
      global.id = response.body.id;

      res.redirect(response.body.init_point);
      //res.render("/detail", { preference: data });
    })
    .catch(function (error) {
      console.error(error);
      res.sendStatus(500);
    });
});

app.get("/success", function (req, res) {
  res.render("success", req.query);
});

app.get("/failure", function (req, res) {
  res.render("failure", req.query);
});

app.get("/pending", function (req, res) {
  res.render("pending", req.query);
});

app.post("/notifications", function (req, res) {

  console.error('WEBHOOKS-q', JSON.stringify(req.query));
  console.error('WEBHOOKS-b', JSON.stringify(req.body));
  console.error('WEBHOOKS-id', req.query['data.id']);

  res.sendStatus(200);
});

app.get("/notifications", function (req, res) {
  res.jsonp(notifications);
});

app.listen(port);
