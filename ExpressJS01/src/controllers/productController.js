const {
  getProductsService,
  getProductByIdService,
  getCategoriesService,
  createProductService,
  updateProductService,
  deleteProductService,
  searchProductsService,
  reindexAllProductsService,
} = require("../services/productService");

// ===========================
// GET PRODUCTS WITH PAGINATION
// ===========================
const getProducts = async (req, res) => {
  try {
    // support extra search filters for ES
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sortBy,
      sortOrder,
      minPrice,
      maxPrice,
      promo,
      minViews,
      maxViews,
    } = req.query;

    // if advanced filters are present, try the ES-backed search for richer capabilities
    const advanced = search || minPrice || maxPrice || promo || minViews || maxViews;

    if (advanced) {
      const result = await searchProductsService({
        q: search,
        category,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        promo,
        minViews: minViews ? Number(minViews) : undefined,
        maxViews: maxViews ? Number(maxViews) : undefined,
        sortBy: sortBy || "createdAt",
        sortOrder: sortOrder || "desc",
        page: Number(page),
        limit: Number(limit),
      });

      return res.status(200).json(result);
    }

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
// ADMIN: reindex all products into Elasticsearch
// ===========================
const reindexProducts = async (req, res) => {
  try {
    const result = await reindexAllProductsService();
    return res.status(result.EC === 0 ? 200 : 500).json(result);
  } catch (error) {
    console.error("Error in reindexProducts:", error);
    return res.status(500).json({ EC: -1, EM: "Internal server error" });
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
    const { name, description, price, category, image, stock } = req.body;

    const result = await createProductService({
      name,
      description,
      price,
      category,
      image,
      stock,
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
    const { name, description, price, category, image, stock, isActive } = req.body;

    const result = await updateProductService(id, {
      name,
      description,
      price,
      category,
      image,
      stock,
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
  reindexProducts,
};
