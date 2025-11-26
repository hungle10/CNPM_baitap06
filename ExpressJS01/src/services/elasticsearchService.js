const { esEnabled, client } = require("../config/elasticsearch");
const Product = require("../models/product");

const INDEX = "products";

const ensureIndex = async () => {
  if (!esEnabled || !client) return false;

  const exists = await client.indices.exists({ index: INDEX });
  if (exists.statusCode === 200) return true;

  // Create mapping for product documents
  await client.indices.create({
    index: INDEX,
    body: {
      mappings: {
        properties: {
          name: { type: "text", analyzer: "standard", fields: { keyword: { type: "keyword" } } },
          description: { type: "text", analyzer: "standard" },
          category: { type: "keyword" },
          price: { type: "double" },
          stock: { type: "integer" },
          rating: { type: "double" },
          totalReviews: { type: "integer" },
          isActive: { type: "boolean" },
          createdAt: { type: "date" },
          updatedAt: { type: "date" },
          views: { type: "integer" },
          promotion: {
            properties: {
              active: { type: "boolean" },
              discountPercent: { type: "double" },
            },
          },
        },
      },
    },
  });

  return true;
};

const docFromProduct = (product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  category: product.category,
  price: Number(product.price),
  stock: product.stock ?? 0,
  rating: Number(product.rating ?? 0),
  totalReviews: product.totalReviews ?? 0,
  isActive: product.isActive ?? true,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
  // default values for optional fields (not required in DB)
  views: product.views ?? 0,
  promotion: product.promotion ?? { active: false, discountPercent: 0 },
});

const indexProduct = async (product) => {
  if (!esEnabled || !client) return false;

  await ensureIndex();

  const id = String(product.id);
  const body = docFromProduct(product);

  await client.index({ index: INDEX, id, body, refresh: true });
  return true;
};

const removeProduct = async (id) => {
  if (!esEnabled || !client) return false;

  try {
    await client.delete({ index: INDEX, id: String(id), refresh: true });
    return true;
  } catch (err) {
    // ignore not found
    return false;
  }
};

const bulkIndexAllProducts = async () => {
  if (!esEnabled || !client) return { success: false, reason: "Elasticsearch not configured" };

  await ensureIndex();

  const products = await Product.findAll({ where: {}, raw: true });

  if (!products || products.length === 0) return { success: true, indexed: 0 };

  const body = products.flatMap((p) => [ { index: { _index: INDEX, _id: String(p.id) } }, docFromProduct(p) ]);

  const { body: bulkResponse } = await client.bulk({ refresh: true, body });

  if (bulkResponse.errors) {
    return { success: false, reason: "Bulk indexing errors", info: bulkResponse.items };
  }

  return { success: true, indexed: products.length };
};

const searchProducts = async ({
  q,
  category,
  minPrice,
  maxPrice,
  promo,
  minViews,
  maxViews,
  sortBy = "createdAt",
  sortOrder = "desc",
  page = 1,
  limit = 10,
}) => {
  if (!esEnabled || !client) return null;

  await ensureIndex();

  const must = [];
  const filter = [{ term: { isActive: true } }];

  if (q) {
    must.push({
      multi_match: {
        query: q,
        fields: ["name^3", "description"],
        fuzziness: "AUTO",
        operator: "and",
      },
    });
  }

  if (category) {
    filter.push({ term: { category } });
  }

  if (typeof minPrice !== "undefined" || typeof maxPrice !== "undefined") {
    const range = {};
    if (typeof minPrice !== "undefined") range.gte = minPrice;
    if (typeof maxPrice !== "undefined") range.lte = maxPrice;
    filter.push({ range: { price: range } });
  }

  if (promo !== undefined) {
    filter.push({ term: { "promotion.active": promo === "true" || promo === true } });
  }

  if (typeof minViews !== "undefined" || typeof maxViews !== "undefined") {
    const vrange = {};
    if (typeof minViews !== "undefined") vrange.gte = minViews;
    if (typeof maxViews !== "undefined") vrange.lte = maxViews;
    filter.push({ range: { views: vrange } });
  }

  const sort = [];
  // map sortBy to ES fields
  const fieldMap = { name: "name.keyword", price: "price", rating: "rating", createdAt: "createdAt", views: "views" };
  const sortField = fieldMap[sortBy] ?? sortBy;
  const direction = sortOrder && sortOrder.toLowerCase().startsWith("asc") ? "asc" : "desc";

  sort.push({ [sortField]: { order: direction } });

  const body = {
    from: (page - 1) * limit,
    size: limit,
    query: {
      bool: {
        must,
        filter,
      },
    },
    sort,
  };

  const { body: result } = await client.search({ index: INDEX, body });

  const hits = result.hits.hits.map((h) => ({ id: h._id, ...h._source }));
  const total = typeof result.hits.total === "number" ? result.hits.total : result.hits.total.value;

  return {
    EC: 0,
    data: hits,
    pagination: {
      total,
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      hasMore: page * limit < total,
    },
  };
};

module.exports = {
  ensureIndex,
  indexProduct,
  removeProduct,
  bulkIndexAllProducts,
  searchProducts,
};
