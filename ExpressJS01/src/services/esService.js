const client = require('../config/elasticsearch');

const INDEX = 'products';

async function ensureIndex() {
  try {
    const exists = await client.indices.exists({ index: INDEX });

    if (!exists) {
      await client.indices.create({
        index: INDEX,
        body: {
          mappings: {
            properties: {
              id: { type: 'integer' },
              name: { type: 'text' },
              description: { type: 'text' },
              price: { type: 'double' },
              category: { type: 'keyword' },
              image: { type: 'keyword' },
              stock: { type: 'integer' },
              rating: { type: 'double' },
              totalReviews: { type: 'integer' },
              isActive: { type: 'boolean' },
              isOnPromotion: { type: 'boolean' },
              views: { type: 'integer' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' }
            }
          }
        }
      });
    }
  } catch (err) {
    console.error('Error ensuring index exists:', err);
  }
}

async function indexProduct(product) {
  try {
    await ensureIndex();

    const body = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      category: product.category,
      image: product.image,
      stock: product.stock,
      rating: Number(product.rating || 0),
      totalReviews: product.totalReviews || 0,
      isActive: !!product.isActive,
      isOnPromotion: !!product.isOnPromotion,
      views: product.views || 0,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    await client.index({ index: INDEX, id: String(product.id), document: body });
  } catch (err) {
    console.error('Error indexing product:', err);
  }
}

async function bulkIndex(products = []) {
  try {
    await ensureIndex();

    if (!Array.isArray(products) || products.length === 0) return;

    const ops = [];

    for (const p of products) {
      ops.push({ index: { _index: INDEX, _id: String(p.id) } });
      ops.push({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        category: p.category,
        image: p.image,
        stock: p.stock,
        rating: Number(p.rating || 0),
        totalReviews: p.totalReviews || 0,
        isActive: !!p.isActive,
        isOnPromotion: !!p.isOnPromotion,
        views: p.views || 0,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      });
    }

    const response = await client.bulk({ refresh: true, operations: ops });

    if (response.errors) {
      console.warn('Bulk index had errors', response.items);
    }
  } catch (err) {
    console.error('Error bulk indexing:', err);
  }
}

async function deleteProductFromIndex(id) {
  try {
    await client.delete({ index: INDEX, id: String(id) });
  } catch (err) {
    // If not found ignore
    if (err?.meta?.statusCode !== 404) {
      console.error('Error deleting product from index:', err);
    }
  }
}

async function searchProducts({
  q,
  category,
  minPrice,
  maxPrice,
  isOnPromotion,
  minViews,
  minRating,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  page = 1,
  limit = 10,
}) {
  try {
    await ensureIndex();

    const must = [];
    const filter = [];

    // full text
    if (q) {
      must.push({
        multi_match: {
          query: q,
          fields: ['name^3', 'description'],
          fuzziness: 'AUTO'
        }
      });
    }

    if (category) {
      filter.push({ term: { category } });
    }

    if (minPrice != null || maxPrice != null) {
      const range = {};
      if (minPrice != null) range.gte = Number(minPrice);
      if (maxPrice != null) range.lte = Number(maxPrice);
      filter.push({ range: { price: range } });
    }

    if (isOnPromotion != null) {
      filter.push({ term: { isOnPromotion: !!(isOnPromotion === 'true' || isOnPromotion === true) } });
    }

    if (minViews != null) {
      filter.push({ range: { views: { gte: Number(minViews) } } });
    }

    if (minRating != null) {
      filter.push({ range: { rating: { gte: Number(minRating) } } });
    }

    // Default sort mapping (map external sortBy keys to ES fields)
    const validSortFields = new Set(['price', 'rating', 'totalReviews', 'views', 'createdAt']);
    const sortField = validSortFields.has(sortBy) ? sortBy : 'createdAt';

    const esQuery = {
      bool: {
        must,
        filter,
      }
    };

    // avoid empty must + filter producing match_all? ES accepts match_all; produce match_all if nothing
    let finalQuery = esQuery;
    if (must.length === 0 && filter.length === 0) finalQuery = { match_all: {} };

    const from = (page - 1) * limit;

    const resp = await client.search({
      index: INDEX,
      from,
      size: limit,
      body: {
        query: finalQuery,
        sort: [{ [sortField]: { order: sortOrder } }]
      }
    });

    const total = resp.hits.total?.value || 0;
    const hits = resp.hits.hits.map((h) => ({ id: h._id, ...h._source }));

    return {
      EC: 0,
      data: hits,
      pagination: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      }
    };
  } catch (err) {
    console.error('Error searching products in ES:', err);
    return { EC: -1, EM: 'Search failed' };
  }
}

module.exports = { ensureIndex, indexProduct, bulkIndex, deleteProductFromIndex, searchProducts };
