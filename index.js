const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Chat = require("./models/chat.js");
const methodOverride = require("method-override");
const ExpressError = require("./ExpressError");
const port = 8080;

main()
  .then(() => {
    console.log("connection successful");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/fakewhatsapp");
}

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true })); //for parsing
app.use(methodOverride("_method"));

//------------index route-----------------

app.get("/chats", async (req, res) => {
  try {
    let chats = await Chat.find();
    console.log(chats);
    res.render("index.ejs", { chats });
  } catch (err) {
    next(err);
  }
});

//-------------new route---------------

app.get("/chats/new", (req, res) => {
  // throw new ExpressError(404, "page not found");
  res.render("new.ejs");
});

//------------Create route ---------

app.post(
  "/chats",
  asyncWrap(async (req, res, next) => {
    let { from, to, msg } = req.body;
    let newChat = new Chat({
      from: from,
      to: to,
      msg: msg,
      created_at: new Date(),
    });

    await newChat.save();
    res.redirect("/chats");
  })
);

function asyncWrap(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
}

//-----NEW---Show--route--for--error--handling---

app.get(
  "/chats/:id",
  asyncWrap(async (req, res, next) => {
    let { id } = req.params;
    let chat = await Chat.findById(id);
    if (!chat) {
      next(new ExpressError(500, "chat not found"));
    }
    res.render("edit.ejs", { chat });
  })
);

//--------------EDIT ROUTE------------

app.get("/chats/:id/edit", async (req, res) => {
  try {
    let { id } = req.params; 
    let chat = await Chat.findById(id);
    res.render("edit.ejs", { chat });
  } catch (err) {
    next(err);
  }
});

//------------------UPDATE ROUTE------------

app.put(
  "/chats/:id",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    let { msg: newMsg } = req.body;
    let updatedChat = await Chat.findByIdAndUpdate(
      id,
      { msg: newMsg },
      { runValidators: true, new: true }
    );
    console.log(updatedChat);
    res.redirect("/chats");
  })
);

//--------------------Destroy ROUTE---------------
app.delete(
  "/chats/:id",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    let deletedChat = await Chat.findByIdAndDelete(id);
    console.log(deletedChat);
    res.redirect("/chats");
  })
);

//----------basic functionalities----
app.get("/", (req, res) => {
  res.send("root is working ");
});
//----------
const handleValidationErr = (err) => {
  console.log("This was a validaiton error. please follow rules");
  console.dir(err.message);
  return err;
};

//---------mw for printing error name------------
app.use((err, req, res, next) => {
  console.log(err.name);
  if (err.name === "ValidationError") {
    err = handleValidationErr(err);
  }
  next(err);
});

//----------error handling mw-------
app.use((err, req, res, next) => {
  let { status = 500, message = "Some Error Ocurred" } = err;
  res.status(status).send(message);
});

app.listen(port, () => {
  console.log(`server listening on port no. ${port}`);
});
