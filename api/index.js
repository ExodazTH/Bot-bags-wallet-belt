const express = require("express");
const line = require("@line/bot-sdk");
const axios = require("axios");
const qs = require("qs");

const config = {
  channelAccessToken: "EfYf6pvsI+tRp0IYDkoOBDtcmKXIsZzvmyckM2EdlcsZO0TH1rcxojGcjE7oI+2g/s/v/DEVhWuV5Hw6asJyahOQ5C0dInBzaoxx9lCe+d2uub5aTw3bnCPpADtKAPbsv2A3oMSziE80vg+lCEA7qAdB04t89/1O/w1cDnyilFU=", // add your channel access token
  channelSecret: "b6dbdd2fe0c135e650144a127e4ef5d0", // add your channel secret
};

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbQxPsUK_JbbaCFoeh-arDaFYykJUrlGyHjxCh6iCSsaBlDBOSnM4bo7NP3AX28IDxKw/exec"; // add your google app script url

const app = express();

app.get("/api", (req, res) => res.send("Hello World!"));

app.post("/api/webhook", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

const client = new line.Client(config);
async function handleEvent(event) {
  console.log("event", event);
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  try {
    const data = await axios.post(
      APPS_SCRIPT_URL,
      qs.stringify({
        text: event.message.text,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log(data.data);

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: data.data.message,
    });
  } catch (err) {
    console.error(err);

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "กรุณาลองใหม่อีกครั้งค่ะ",
    });
  }
}

module.exports = app;
