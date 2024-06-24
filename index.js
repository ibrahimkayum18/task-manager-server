const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.pqcfxjd.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const projectCollection = client.db("TaskManager").collection("projects");
    const skillsCollection = client.db("TaskManager").collection("skills");
    const usersCollection = client.db("TaskManager").collection("users");

    // User Collection API's

    app.post("/users", async (req, res) => {
      const data = req.body;
      data.role = "users";
      data.createdAt = new Date();
      const result = await usersCollection.insertOne(data);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const email = req.query.email;
      if (email) {
        const result = await usersCollection.find({ email: email }).toArray();
        res.send(result);
      } else {
        const result = await usersCollection.find().toArray();
        res.send(result);
      }
    });

    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = {
        _id: new ObjectId(id),
      };
      const option = { upsert: true };
      const updateData = {
        $set: {
          name: data.name,
          email: data.email,
          organization: data.organization,
          photoURL: data.photoURL,
          role: data.role,
          createdAt: data.createdAt,
          modifiedAt: new Date(),
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updateData,
        option
      );
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // Projects Creation and Operations api

    app.post("/projects", async (req, res) => {
      const data = req.body;
      data.createdAt = new Date();
      const result = await projectCollection.insertOne(data);
      res.send(result);
    });

    app.get("/projects", async (req, res) => {
      const result = await projectCollection.find().toArray();
      res.send(result);
    });
    app.get("/skills", async (req, res) => {
      const result = await skillsCollection.find().toArray();
      res.send(result);
    });

    app.get("/projects/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await projectCollection.find(query);
      res.send(result);
    });

    app.delete("/projects/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await projectCollection.deleteOne(query);
      res.send(result);
    });

    // for New projects

    app.put("/projects/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = {
        _id: new ObjectId(id),
      };
      const option = { upsert: true };
      const updateData = {
        $set: {
          title: data.title,
          description: data.description,
          deadline: data.deadline,
          priority: data.priority,
          createdAt: data.createdAt,
          modifiedAt: new Date(),
          members: data.members,
          assignedWork: data.assignedWork,
        },
      };
      const result = await projectCollection.updateOne(
        filter,
        updateData,
        option
      );
      res.send(result);
    });

    app.patch("/projects/todo/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          process: "todo",
        },
      };
      const result = await projectCollection.updateOne(query, updatedDoc);
      res.send(result);
    });
    app.patch("/projects/ongoing/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          process: "ongoing",
        },
      };
      const result = await projectCollection.updateOne(query, updatedDoc);
      res.send(result);
    });
    app.patch("/projects/finished/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          process: "finished",
        },
      };
      const result = await projectCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
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
  res.send("MadeIT Server is running");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
