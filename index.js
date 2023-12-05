const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: ["http://localhost:5173","http://localhost:5174","https://the-dragon-house.web.app","https://assignment-eleven-mahfuz.surge.sh"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "One unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "Tow Unauthorized access" });
    }
    console.log("Value In The Token", decoded);
    req.user = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.efkktro.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const blogsCollection = client.db("blogsDB").collection("blogs");
    const wishlistCollection = client.db("blogsDB").collection("wishlist");
    const popularWishlistCollection = client.db("blogsDB").collection("popularWishlist");
    const popularCollection = client.db("blogsDB").collection("popular");
    const commentCollection = client.db("blogsDB").collection("comment");

    // AUTH RELATED APIS
    // post auth
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      // console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true });
    });


    // clear cookies after logOut user
    app.post("/logOut", async (req, res) => {
      const user = req.body;
      console.log('logOut user', user);
      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
    });

    // add blogs
    // add blogs post
    app.post("/addBlogs", async (req, res) => {
      const newBrand = req.body;
      const result = await blogsCollection.insertOne(newBrand);
      res.send(result);
    });
    // add blogs get all
    app.get("/addBlogs", async (req, res) => {
      const result = await blogsCollection.find().toArray();
      res.send(result);
    });
    // add brand get specific id
    app.get("/addBlogs/:id", async (req, res) => {
      const id = req.params.id;
      const result = await blogsCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });
    // update product
    app.put("/addBlogs/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatesProduct = req.body;
      console.log(updatesProduct);
      const product = {
        $set: {
          title: updatesProduct.title,
          description: updatesProduct.description,
          coffee_type: updatesProduct.coffee_type,
          image: updatesProduct.image,
          publish_date: updatesProduct.publish_date,
          createdAt: updatesProduct.createdAt,
          userEmail: updatesProduct.userEmail,
          userName: updatesProduct.userName,
          userPhoto: updatesProduct.userPhoto,
        },
      };
      const result = await blogsCollection.updateOne(
        filter,
        product,
        options
      );
      res.send(result);
    });
    
    // wishlist
    // cart post operation
    app.post("/wishlist", async (req, res) => {
      const newCart = req.body;
      console.log(newCart);
      const result = await wishlistCollection.insertOne(newCart);
      res.send(result);
    });
    // get
    app.get("/wishlist/:email", verifyToken, async (req, res) => {
      if (req.params.email !== req.user.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      if (req.params.email) {
        query = { userEmail: req.params.email };
      }
      console.log(query);
      const result = await wishlistCollection.find(query).toArray();
      res.send(result);
    });
    // Deleting wishlist data
    app.delete("/wishlist/:id", async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const result = await wishlistCollection.deleteOne(query);
      res.send(result);
    });

    //popular wishlist
    // popularWishlists post operation
    app.post("/popularWishlist", async (req, res) => {
      const newCart = req.body;
      console.log(newCart);
      const result = await popularWishlistCollection.insertOne(newCart);
      res.send(result);
    });
    // get all popularWishlists
    app.get("/popularWishlist", async (req, res) => {
      const result = await popularWishlistCollection.find().toArray();
      res.send(result);
    });
    // get popularWishlist specific
    app.get("/popularWishlist/:email", verifyToken, async (req, res) => {
      if (req.params.email !== req.user.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      if (req.params.email) {
        query = { userEmail: req.params.email };
      }
      console.log(query);
      const result = await popularWishlistCollection.find(query).toArray();
      res.send(result);
    });
    // Deleting popularWishlists
    app.delete("/popularWishlist/:id", async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const result = await popularWishlistCollection.deleteOne(query);
      res.send(result);
    });
    
    


    // POPULAR
    // popular get all
    app.get("/popularPosts", async (req, res) => {
      const result = await popularCollection.find().toArray();
      res.send(result);
    });
    // Popular get specific id
    app.get("/popularPosts/:id", async (req, res) => {
      const id = req.params.id;
      const result = await popularCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });
    


    // add comment
    // add comment post
    app.post("/addComments", async (req, res) => {
      const newBrand = req.body;
      const result = await commentCollection.insertOne(newBrand);
      res.send(result);
    });
    // comment get specific
    app.get("/addComments/:id", async (req, res) => {
      const id = req.params.id;
      const query = {BlogId : id}
      const result = await commentCollection.find(query).toArray();
      res.send(result);
    });
    // comment get all
    app.get("/addComments", async (req, res) => {
      const result = await commentCollection.find().toArray();
      res.send(result);
    });

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Hello World!");
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });