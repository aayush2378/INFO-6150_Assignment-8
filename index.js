const mongoose = require("mongoose");
const express = require("express");
const app = express();
app.use(express.json());
const { body, validationResult } = require("express-validator");
const User = require("./User");
const bcrypt = require("bcryptjs");

main().catch((err) => console.log(err));

async function main() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/assignment8DB", {
      useNewUrlParser: true,
    });
    console.log("Connection to MongoDB established.");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}


app.post(
  "/user/create",
  [
    body(
      "fullName",
      "Please enter a valid full name. Minimum length: 6 characters"
    ).isLength({ min: 6 }),
    body("email", "Please enter a valid email").isEmail(),
    body(
      "password",
      "Please enter a valid password. Minimum length: 8 characters"
    ).isLength({ min: 8 }),
  ],
  async (req, res) => {
    // Handle the GET request for /api/user here


    
const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      //Check whether a user with the same email exists already

      
    let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "A user with this email already exists" });
      }

      const password = String(req.body.password);

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);

      // Create new user and save it in database
      user = await User.create({
        fullName: req.body.fullName,
        email: req.body.email,
        password: secPass,
      });
      res.json(user);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("An error occured");
    }
  }
);


app.put(
  "/user/edit/:email",
  [
    // Validate the request body
    body(
      "fullName",
      "Please enter a valid full name. Minimum length: 6 characters"
    ).isLength({ min: 6 }),
    body(
      "password",
      "Please enter a valid password. Minimum length: 8 characters"
    ).isLength({ min: 8 }),
  ],
  async (req, res) => {
    // Handle the PUT request for /api/user/:id here

    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      // Find the user to be edited
      const user = await User.findOne({ email: req.params.email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const password = String(req.body.password);

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);

      // Update the user's name and password
      user.fullName = req.body.fullName;
      user.password = secPass;

      // Save the updated user
      await user.save();

      // Return the updated user
      res.json(user);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("An error occurred");
    }
  }
);


app.delete("/user/delete/:email", async (req, res) => {
  // Handle the DELETE request for /api/user/:email here
 
  try {
    // Find the user to be deleted
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
 
    // Delete the user
    await user.deleteOne();
 
    // Return a success response
    res.json({success: "user deleted successfully"});
  } catch (error) {
    console.error(error.message);
    res.status(500).send("An error occurred");
  }
 });



app.get(
  "/user/getAll",
  async (req, res) => {
    // Handle the GET request for /api/users here

    try {
      // Get all users from the database
      const users = await User.find();

      // Return the users to the client
      res.json(users);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("An error occurred");
    }
  }
);


app.listen(3000, function () {
  console.log("backend server started at port 3000");
});
