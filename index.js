const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
//const users = require("./MOCK_DATA.json");
const { error } = require("console");
const app = express();
const PORT = 8000;

//conection
mongoose
  .connect("mongodb://127.0.0.1:27017/node-crud")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("Mongo Error", err));

//Schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    jobTitle: {
      type: String,
    },
    gender: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);
//Middleware -Plugin
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log("Hello from middleware 1");
  next();
});
//Routes
app.get("/users", async (req, res) => {
  const allDbUsers = await User.find({});
  const html = `
    <ul>
      ${allDbUsers
        .map((user) => `<li>${user.firstName}-${user.email}</li>`)
        .join("")}
    </ul>`;
  res.send(html);
});

//REST API
app.get("/api/users", async (req, res) => {
  const allDbUsers = await User.find({});
  return res.json(allDbUsers);
});

app
  .route("/api/users/:id")
  .get(async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      return res.json(user);
    } catch (err) {
      return res.json({
        status: "Something Went Wrong or user with id does not exist.",
      });
    }
  })
  .patch(async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.json({
          status: "failed",
          Reason: `User with id:${req.params.id} does not exist.`,
        });
      }

      const updatedFields = {
        firstName: req.body.firstName ?? user.firstName,
        lastName: req.body.lastName ?? user.lastName,
        email: req.body.email ?? user.email,
        gender: req.body.gender ?? user.gender,
        jobTitle: req.body.jobTitle ?? user.jobTitle,
      };

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updatedFields,
        { new: true }
      );

      return res.json({
        status: "success",
        data: updatedUser,
      });
    } catch (err) {
      return res.json({
        status: "failed",
        Reason: `Error updating user with id:${req.params.id}`,
      });
    }
  })
  .delete(async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      return res.json({ status: "Success" });
    } catch (error) {
      return res.json({
        status: "failed",
        Reason: `Either user with id:${id} already deleted or doesn't exist.`,
      });
    }
  });

app.post("/api/users", async (req, res) => {
  const body = req.body;
  if (
    !body ||
    !body.firstName ||
    !body.lastName ||
    !body.email ||
    !body.gender ||
    !body.jobTitle
  ) {
    return res.status(400).json({ msg: "All fields are required..." });
  }
  const result = await User.create({
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    gender: body.gender,
    jobTitle: body.jobTitle,
  });
  return res.status(201).json({ msg: "success" });
});

app.listen(PORT, () => {
  console.log(`Server started at PORT:${PORT}`);
});
