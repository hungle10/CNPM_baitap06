const Product = require("../models/product");
const esService = require("./esService");
const { Op } = require("sequelize");

// ===========================
// GET PRODUCTS WITH PAGINATION
// ===========================
const getProductsService = async (
  page = 1,
  limit = 10,
  category = null,
  search = null,
  sortBy = "createdAt",
  sortOrder = "DESC"
) => {
  try {
    // Build where clause
    const where = { isActive: true };

    if (category) {
      where.category = category;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch products
    const { rows, count } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / limit);

    return {
      EC: 0,
      data: rows,
      pagination: {
        total: count,
        currentPage: page,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      EC: -1,
      EM: "Error fetching products",
    };
  }
};

// ===========================
// SEARCH PRODUCTS (Elasticsearch)
// ===========================
const searchProductsService = async (queryParams) => {
  try {
    const result = await esService.searchProducts(queryParams);
    return result;
  } catch (error) {
    console.error('Error in searchProductsService:', error);
    return { EC: -1, EM: 'Search service error' };
  }
};

// ===========================
// GET PRODUCT BY ID
// ===========================
const getProductByIdService = async (id) => {
  try {
    const product = await Product.findByPk(id);

    if (!product) {
      return {
        EC: 1,
        EM: "Product not found",
      };
    }

    return {
      EC: 0,
      data: product,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return {
      EC: -1,
      EM: "Error fetching product",
    };
  }
};

// ===========================
// GET ALL CATEGORIES
// ===========================
const getCategoriesService = async () => {
  try {
    const categories = await Product.findAll({
      where: { isActive: true },
      attributes: ["category"],
      group: ["category"],
      raw: true,
    });

    return {
      EC: 0,
      data: categories.map((item) => item.category),
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      EC: -1,
      EM: "Error fetching categories",
    };
  }
};

// ===========================
// CREATE PRODUCT (ADMIN ONLY)
// ===========================
const createProductService = async (productData) => {
  try {
      const {
        name,
        description,
        price,
        category,
        image,
        stock,
        isOnPromotion,
        views,
      } = productData;

    // Validate required fields
    if (!name || !price || !category) {
      return {
        EC: 1,
        EM: "Name, price, and category are required",
      };
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock: stock || 0,
      isOnPromotion: !!isOnPromotion,
      views: views || 0,
    });

    // index to Elasticsearch
    try {
      await esService.indexProduct(product);
    } catch (e) {
      console.warn('Indexing after create failed', e);
    }

    return {
      EC: 0,
      EM: "Product created successfully",
      data: product,
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      EC: -1,
      EM: "Error creating product",
    };
  }
};

// ===========================
// UPDATE PRODUCT (ADMIN ONLY)
// ===========================
const updateProductService = async (id, productData) => {
  try {
    const product = await Product.findByPk(id);

    if (!product) {
      return {
        EC: 1,
        EM: "Product not found",
      };
    }

    await product.update(productData);

      // reindex updated product
      try {
        await esService.indexProduct(product);
      } catch (e) {
        console.warn('Indexing after update failed', e);
      }

    return {
      EC: 0,
      EM: "Product updated successfully",
      data: product,
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      EC: -1,
      EM: "Error updating product",
    };
  }
};

// ===========================
// DELETE PRODUCT (ADMIN ONLY)
// ===========================
const deleteProductService = async (id) => {
  try {
    const product = await Product.findByPk(id);

    if (!product) {
      return {
        EC: 1,
        EM: "Product not found",
      };
    }

    await product.update({ isActive: false });

      // remove or update from ES index
      try {
        await esService.deleteProductFromIndex(id);
      } catch (e) {
        // Log and continue
        console.warn('Removing product from index failed', e);
      }

    return {
      EC: 0,
      EM: "Product deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      EC: -1,
      EM: "Error deleting product",
    };
  }
};

module.exports = {
  getProductsService,
  getProductByIdService,
  getCategoriesService,
  createProductService,
  updateProductService,
  deleteProductService,
  searchProductsService,
};
