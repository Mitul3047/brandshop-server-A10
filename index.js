
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3000; // Use process.env.PORT or default to 3000

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zkhcmhi.mongodb.net/?retryWrites=true&w=majority`;

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
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const productCollection = client.db("productDB").collection("Product")




        // code 2 get all product
        app.get('/product', async (req, res) => {
            const cursor = productCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        // code for find

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.findOne(query);
            res.send(result);
        })
        // app.get('/product/:brand_name', async (req, res) => {
        //     const brand_name = req.params.brand_name;
        //     const query = { brand_name: brand_name }
        //     const result = await productCollection.find(query);
        //     res.send(result);
        // })

        // app.get('/product/:brandName', async (req, res) => {
        //     const brandName = req.params.brandName;
        //     console.log('solo',brandName);
        //     const query = { brand_name: brandName };
        //     const result = await productCollection.findOne(query) // Convert the result to an array
        //     res.send(result);
        // })
        app.get('/product/by-brand/:brand_name', async (req, res) => {
            const brandname = req.params.brand_name;
            console.log('brand name', brandname);
            const query = { brand_name: { $regex: new RegExp(brandname, 'i') } };
            const result = await productCollection.findOne(query);

            res.send(result);
            console.log('brand name res', result);
        })



        // code1 add product
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            console.log(newProduct);
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        })
        // code 5 put or update
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedProduct = req.body;
            const product = {
                $set: {
                    name: updatedProduct.name,
                    brand_name: updatedProduct.brand_name,
                    type: updatedProduct.type,
                    price: updatedProduct.price,
                    description: updatedProduct.description,
                    rating: updatedProduct.rating,
                    photo: updatedProduct.photo

                }
            }
            const result = await productCollection.updateOne(filter, product, options)
            res.send(result);
        })


        //  cart server
        const cartCollection = client.db("productDB").collection("cart")

        // get all cart
        app.get('/cart', async (req, res) => {
            const cursor = cartCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await cartCollection.findOne(query);
            res.send(result);
        })
        // add cart
        app.post('/cart', async (req, res) => {
            const dataToSend = req.body;
            console.log(dataToSend);
            const result = await cartCollection.insertOne(dataToSend);
            res.send(result);
        })
        // delete cart
        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) }
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        })





        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello from tech guru server side!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})