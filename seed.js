require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');

// Sample data (from previous message)
const users = [
    {
      _id: "507f1f77bcf86cd799439011",
      username: "GreenTraveler",
      email: "emma@vegan.com",
      password: "securepass123"
    },
    {
      _id: "507f1f77bcf86cd799439012",
      username: "PlantBasedNomad",
      email: "liam@vegan.com",
      password: "travelsafe456"
    },
    {
      _id: "507f1f77bcf86cd799439013",
      username: "VeganExplorer",
      email: "sophia@vegan.com",
      password: "discover789"
    },
    {
      _id: "507f1f77bcf86cd799439014",
      username: "EcoFoodie",
      email: "noah@vegan.com",
      password: "greenearth321"
    }
  ];

const products = [
    { // Thailand
      _id: "648a3b1e5f1d8a2e24567891",
      name: "Pad Thai Vegan",
      category: "Local dish",
      description: "",
      ingredients: "",
      country: "Thailand",
      addedBy: "507f1f77bcf86cd799439011",
      comments: [
        {
          user: "507f1f77bcf86cd799439012",
          text: "Authentic taste!",
          createdAt: new Date("2023-06-15")
        }
      ]
    },
    { // Thailand
      _id: "648a3b1e5f1d8a2e24567892",
      name: "Mango Sticky Rice",
      category: "dessert",
      description: "",
      ingredients: "",
      country: "Thailand",
      addedBy: "507f1f77bcf86cd799439012",
      comments: []
    },
    { // Thailand
      _id: "648a3b1e5f1d8a2e24567893",
      name: "Thai Spring Rolls",
      category: "street food",
      description: "",
      ingredients: "",
      country: "Thailand",
      addedBy: "507f1f77bcf86cd799439013",
      comments: []
    },
    { // Italy
      _id: "648a3b1e5f1d8a2e24567894",
      name: "Vegan Margherita Pizza",
      category: "Local dish",
      description: "",
      ingredients: "",
      country: "Italy",
      addedBy: "507f1f77bcf86cd799439014",
      comments: [
        {
          user: "507f1f77bcf86cd799439011",
          text: "Best pizza in Rome!",
          createdAt: new Date("2023-07-01")
        }
      ]
    },
    { // Italy
      _id: "648a3b1e5f1d8a2e24567895",
      name: "Vegan Gelato",
      category: "dessert",
      description: "",
      ingredients: "",
      country: "Italy",
      addedBy: "507f1f77bcf86cd799439012",
      comments: []
    },
    { // Italy
      _id: "648a3b1e5f1d8a2e24567896",
      name: "Olive Focaccia",
      category: "snack",
      description: "",
      ingredients: "",
      country: "Italy",
      addedBy: "507f1f77bcf86cd799439013",
      comments: []
    },
    { // Mexico
      _id: "648a3b1e5f1d8a2e24567897",
      name: "Vegan Tacos al Pastor",
      category: "street food",
      description: "",
      ingredients: "",
      country: "Mexico",
      addedBy: "507f1f77bcf86cd799439014",
      comments: []
    },
    { // Mexico
      _id: "648a3b1e5f1d8a2e24567898",
      name: "Churros Veganos",
      category: "dessert",
      description: "",
      ingredients: "",
      country: "Mexico",
      addedBy: "507f1f77bcf86cd799439011",
      comments: []
    },
    { // Japan
      _id: "648a3b1e5f1d8a2e24567899",
      name: "Vegan Ramen",
      category: "Local dish",
      description: "",
      ingredients: "",
      country: "Japan",
      addedBy: "507f1f77bcf86cd799439012",
      comments: []
    },
    { // Japan
      _id: "648a3b1e5f1d8a2e2456789a",
      name: "Mochi Ice Cream",
      category: "dessert",
      description: "",
      ingredients: "",
      country: "Japan",
      addedBy: "507f1f77bcf86cd799439013",
      comments: []
    }
  ];

const seedDatabase = async () => {
  try {
    // Connect to DB
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();

    // Hash passwords and create users
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { 
          ...user, 
          password: hashedPassword 
        };
      })
    );

    // Insert users
    const createdUsers = await User.insertMany(hashedUsers);

    // Insert products
    const createdProducts = await Product.insertMany(products);

    console.log('Database seeded successfully!');
    console.log(`Inserted ${createdUsers.length} users`);
    console.log(`Inserted ${createdProducts.length} products`);
    process.exit();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();