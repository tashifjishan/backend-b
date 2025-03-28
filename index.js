const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const port = process.env.PORT || 5000;

// parse options
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use(
  cors({
    origin: "https://frontend-b-pri.vercel.app",
    credentials: true,
  })
);

// routes
const blogRoutes = require("./src/routers/blog.routes");
const commentRoutes = require("./src/routers/Comment.routes");
const userRoutes = require("./src/routers/auth.user.routes");
app.use("/api/auth", userRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/comments", commentRoutes);
app.get("/", (req, res)=>{
  res.send("welcome now!")
})

app.get("/contact", (req, res)=>{
  res.send("contact karna chahte ho!")
})
async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
  
}
main()
  .then(() => console.log("mongodb connected successfully"))
  .catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


module.exports = app