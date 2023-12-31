const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7mrpr8s.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const foodsCollection = client.db("foodsData").collection("foods");
    const orderedCollection = client.db("foodsData").collection("orderedFoods");
    const usersCollection = client.db("foodsData").collection("users");

    app.get("/foods", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const result = await foodsCollection
        .find()
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodsCollection.findOne(query);
      res.send(result);
    });

    app.post("/foods", async (req, res) => {
      const newFood = req.body;
      const result = await foodsCollection.insertOne(newFood);
      res.send(result);
    });

    app.put("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateFood = req.body;
      const updateDoc = {
        $set: {
          food_name: updateFood.food_name,
          food_image: updateFood.food_image,
          food_category: updateFood.food_category,
          price: updateFood.price,
          quantity: updateFood.quantity,
          description: updateFood.description,
          provider: updateFood.provider,
          providerEmail: updateFood.providerEmail,
        },
      };
      const result = await foodsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.patch("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedOrdered = req.body;
      const updatedDoc = {
        $set: {
          ordered: updatedOrdered.afterOrder,
        },
      };
      const result = await foodsCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.get("/foodsCount", async (req, res) => {
      const count = await foodsCollection.estimatedDocumentCount();
      res.send({ count });
    });

    app.get("/orderedFoods", async (req, res) => {
      const cursor = orderedCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/orderedFoods", async (req, res) => {
      const newOrder = req.body;
      const result = await orderedCollection.insertOne(newOrder);
      res.send(result);
    });

    app.delete("/orderedFoods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await orderedCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.listen(port, () => {
  console.log(`HungryHarmony server is running on port ${port}`);
});
