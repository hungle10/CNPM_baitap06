// This script creates sample product data for testing
// Run this after database is synced

const Product = require("../models/product");

const sampleProducts = [
  {
    name: "MacBook Pro 16 inch",
    description: "High-performance laptop with Apple M2 Max chip, 16GB RAM, 512GB SSD",
    price: 2499.99,
    category: "Laptops",
    image: "https://via.placeholder.com/300x200?text=MacBook+Pro",
    stock: 15,
    rating: 4.8,
    totalReviews: 245,
  },
  {
    name: "Dell XPS 13 Plus",
    description: "Ultraslim laptop with Intel Core i7, perfect for professionals",
    price: 1699.99,
    category: "Laptops",
    image: "https://via.placeholder.com/300x200?text=Dell+XPS",
    stock: 20,
    rating: 4.6,
    totalReviews: 189,
  },
  {
    name: "Logitech MX Master 3S",
    description: "Advanced wireless mouse with customizable buttons and precision scrolling",
    price: 99.99,
    category: "Mice",
    image: "https://via.placeholder.com/300x200?text=Logitech+Mouse",
    stock: 50,
    rating: 4.9,
    totalReviews: 567,
  },
  {
    name: "Razer DeathAdder V3",
    description: "Gaming mouse with 30000 DPI sensor and RGB lighting",
    price: 79.99,
    category: "Mice",
    image: "https://via.placeholder.com/300x200?text=Razer+Mouse",
    stock: 35,
    rating: 4.7,
    totalReviews: 432,
  },
  {
    name: "Keychron K2 Mechanical Keyboard",
    description: "Wireless mechanical keyboard with hot-swappable switches",
    price: 89.99,
    category: "Keyboards",
    image: "https://via.placeholder.com/300x200?text=Keychron",
    stock: 25,
    rating: 4.8,
    totalReviews: 389,
  },
  {
    name: "Cherry MX Switch Mechanical Keyboard",
    description: "Premium mechanical keyboard with Cherry MX switches, aluminum frame",
    price: 189.99,
    category: "Keyboards",
    image: "https://via.placeholder.com/300x200?text=Cherry+Keyboard",
    stock: 18,
    rating: 4.7,
    totalReviews: 276,
  },
  {
    name: "Dell UltraSharp U2723DE",
    description: "27-inch 4K monitor with USB-C, perfect for content creators",
    price: 499.99,
    category: "Monitors",
    image: "https://via.placeholder.com/300x200?text=Dell+Monitor",
    stock: 12,
    rating: 4.8,
    totalReviews: 234,
  },
  {
    name: "LG 38UD99 UltraWide",
    description: "38-inch ultrawide monitor with 3840x1600 resolution",
    price: 1299.99,
    category: "Monitors",
    image: "https://via.placeholder.com/300x200?text=LG+Ultrawide",
    stock: 8,
    rating: 4.6,
    totalReviews: 156,
  },
  {
    name: "Sony WH-1000XM5",
    description: "Premium noise-cancelling headphones with 30-hour battery life",
    price: 379.99,
    category: "Headphones",
    image: "https://via.placeholder.com/300x200?text=Sony+Headphones",
    stock: 30,
    rating: 4.9,
    totalReviews: 512,
  },
  {
    name: "Apple AirPods Pro",
    description: "Wireless earbuds with active noise cancellation",
    price: 249.99,
    category: "Headphones",
    image: "https://via.placeholder.com/300x200?text=AirPods+Pro",
    stock: 45,
    rating: 4.7,
    totalReviews: 623,
  },
  {
    name: "Sennheiser Momentum 3",
    description: "Over-ear headphones with premium sound quality",
    price: 399.95,
    category: "Headphones",
    image: "https://via.placeholder.com/300x200?text=Sennheiser",
    stock: 22,
    rating: 4.8,
    totalReviews: 298,
  },
  {
    name: "Samsung T7 2TB SSD",
    description: "Portable external SSD with 1050MB/s transfer speed",
    price: 199.99,
    category: "Storage",
    image: "https://via.placeholder.com/300x200?text=Samsung+SSD",
    stock: 40,
    rating: 4.8,
    totalReviews: 445,
  },
  {
    name: "Seagate Barracuda 4TB",
    description: "7200 RPM internal hard drive for gaming and content creation",
    price: 89.99,
    category: "Storage",
    image: "https://via.placeholder.com/300x200?text=Seagate+HDD",
    stock: 55,
    rating: 4.6,
    totalReviews: 378,
  },
  {
    name: "Western Digital WD Blue 1TB",
    description: "Reliable internal SSD for everyday computing",
    price: 79.99,
    category: "Storage",
    image: "https://via.placeholder.com/300x200?text=WD+Blue",
    stock: 60,
    rating: 4.7,
    totalReviews: 521,
  },
  {
    name: "Corsair Vengeance RGB Pro 32GB",
    description: "High-performance RAM with RGB lighting, 3600MHz",
    price: 149.99,
    category: "Memory",
    image: "https://via.placeholder.com/300x200?text=Corsair+RAM",
    stock: 35,
    rating: 4.8,
    totalReviews: 267,
  },
  {
    name: "Intel Core i7-13700K",
    description: "13th Gen Intel processor with 16 cores, excellent for gaming and productivity",
    price: 319.99,
    category: "Processors",
    image: "https://via.placeholder.com/300x200?text=Intel+i7",
    stock: 20,
    rating: 4.9,
    totalReviews: 389,
  },
];

const seedProducts = async () => {
  try {
    // Check if products already exist
    const count = await Product.count();
    
    if (count > 0) {
      console.log(`Database already has ${count} products. Skipping seed.`);
      return;
    }

    await Product.bulkCreate(sampleProducts);
    console.log(`✅ Successfully created ${sampleProducts.length} sample products!`);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
  }
};

module.exports = seedProducts;
