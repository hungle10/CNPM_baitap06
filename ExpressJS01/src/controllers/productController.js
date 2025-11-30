const {
  getProductsService,
  getProductByIdService,
  getCategoriesService,
  createProductService,
  updateProductService,
  deleteProductService,
} = require("../services/productService");

// ===========================
// GET PRODUCTS WITH PAGINATION
// ===========================
const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, sortBy, sortOrder } = req.query;

    const result = await getProductsService(
      parseInt(page),
      parseInt(limit),
      category,
      search,
      sortBy || "createdAt",
      sortOrder?.toUpperCase() || "DESC"
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getProducts:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Internal server error",
    });
  }
};

// ===========================
// SEARCH PRODUCTS (Elasticsearch) - top level
// ===========================
const searchProducts = async (req, res) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      isOnPromotion,
      minViews,
      minRating,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10,
    } = req.query;

    const { searchProductsService } = require('../services/productService');

    const result = await searchProductsService({
      q,
      category,
      minPrice,
      maxPrice,
      isOnPromotion,
      minViews,
      minRating,
      sortBy,
      sortOrder,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return res.status(result.EC === 0 ? 200 : 500).json(result);
  } catch (error) {
    console.error('Error in searchProducts:', error);
    return res.status(500).json({ EC: -1, EM: 'Internal server error' });
  }
};

// ===========================
// GET PRODUCT BY ID
// ===========================
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await getProductByIdService(id);

    return res.status(result.EC === 0 ? 200 : 404).json(result);
  } catch (error) {
    console.error("Error in getProductById:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Internal server error",
    });
  }
};

// ===========================
// GET ALL CATEGORIES
// ===========================
const getCategories = async (req, res) => {
  try {
    const result = await getCategoriesService();

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getCategories:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Internal server error",
    });
  }
};

// ===========================
// CREATE PRODUCT (ADMIN ONLY)
// ===========================
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock, isOnPromotion, views } = req.body;

    const result = await createProductService({
      name,
      description,
      price,
      category,
      image,
      stock,
      isOnPromotion,
      views,
    });

    const statusCode = result.EC === 0 ? 201 : 400;
    return res.status(statusCode).json(result);
  } catch (error) {
    console.error("Error in createProduct:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Internal server error",
    });
  }
};

// ===========================
// UPDATE PRODUCT (ADMIN ONLY)
// ===========================
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image, stock, isActive, isOnPromotion, views } = req.body;

    const result = await updateProductService(id, {
      name,
      description,
      price,
      category,
      image,
      stock,
      isOnPromotion,
      views,
      isActive,
    });

    const statusCode = result.EC === 0 ? 200 : result.EC === 1 ? 404 : 500;
    return res.status(statusCode).json(result);
  } catch (error) {
    console.error("Error in updateProduct:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Internal server error",
    });
  }
};

// ===========================
// DELETE PRODUCT (ADMIN ONLY)
// ===========================
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteProductService(id);

    const statusCode = result.EC === 0 ? 200 : result.EC === 1 ? 404 : 500;
    return res.status(statusCode).json(result);
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Internal server error",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
};
