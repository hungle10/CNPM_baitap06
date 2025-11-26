const Product = require("../models/product");
const {
  indexProduct,
  removeProduct,
  searchProducts: esSearchProducts,
  bulkIndexAllProducts,
} = require("./elasticsearchService");
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
// SEARCH PRODUCTS USING ELASTICSEARCH (if available)
// ===========================
const searchProductsService = async (query) => {
  try {
    const esResult = await esSearchProducts(query);

    if (!esResult) {
      // Elasticsearch not available or not configured, fallback to DB getProducts
      return await getProductsService(
        query.page ?? 1,
        query.limit ?? 10,
        query.category ?? null,
        query.search ?? null,
        query.sortBy ?? "createdAt",
        (query.sortOrder ?? "desc").toUpperCase()
      );
    }

    return esResult;
  } catch (error) {
    console.error("Error searching products (ES):", error);
    return {
      EC: -1,
      EM: "Error searching products",
    };
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
    });

    return {
      EC: 0,
      EM: "Product created successfully",
      data: product,
    };
    // index into Elasticsearch if available (best-effort)
    try {
      await indexProduct(product);
    } catch (err) {
      console.warn("Elasticsearch index failed for new product:", err.message || err);
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

      // update ES index (best-effort)
      try {
        await indexProduct(product);
      } catch (err) {
        console.warn("Elasticsearch index failed for updated product:", err.message || err);
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

    // remove from ES index (best-effort)
    try {
      await removeProduct(product.id);
    } catch (err) {
      console.warn("Elasticsearch remove failed for deleted product:", err.message || err);
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

// expose bulk index utility for admin reindex endpoints
const reindexAllProductsService = async () => {
  try {
    const result = await bulkIndexAllProducts();
    return { EC: 0, EM: "Reindex finished", data: result };
  } catch (err) {
    console.error("Error during reindexing:", err);
    return { EC: -1, EM: "Reindex failed" };
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
  reindexAllProductsService,
};
