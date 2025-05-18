const mongoose = require("mongoose");
const Chat = require("./models/chat.js");

main()
  .then(() => {
    console.log("connection successful");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/fakewhatsapp");
}

let allChats = [
  {
    from: "monalisa",
    to: "aryan",
    msg: "send dbms notes asap",
    created_at: new Date(),
  },
  {
    from: "aman",
    to: "kartik",
    msg: "catchup this weekend>",
    created_at: new Date(),
  },
  {
    from: "piyush",
    to: "aviral",
    msg: "cant get over her",
    created_at: new Date(),
  },
  {
    from: "sakshi",
    to: "aviral",
    msg: "you cheated on me",
    created_at: new Date(),
  },
  {
    from: "arya",
    to: "om",
    msg: "i love you 3000",
    created_at: new Date(),
  },
];

Chat.insertMany(allChats);
