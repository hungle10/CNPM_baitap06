# Elasticsearch integration (Products)

Overview
--------

This project now includes optional Elasticsearch integration for product search. If you set `ELASTICSEARCH_URL` in your environment to a running Elasticsearch node, the app will create/check the `products` index and you can use ES-backed search with advanced filters.

How to enable
-------------

- Add environment variable `ELASTICSEARCH_URL` pointing to your ES node (e.g. `http://localhost:9200`).
- Optionally set `ELASTIC_REINDEX_ON_STARTUP=true` to bulk index all products when the server starts.

Endpoints
---------

Public: GET /v1/api/products

Supports query params:
- page, limit (pagination)
- category (string)
- search (text full-text search across name + description — triggers ES)
- minPrice, maxPrice (numeric)
- promo (boolean) — filters by product.promotion.active in ES index
- minViews, maxViews (numeric)
- sortBy (name, price, rating, createdAt, views)
- sortOrder (asc / desc)

Example search (ES-backed):

curl "http://localhost:8888/v1/api/products?search=macbook&minPrice=1000&maxPrice=3000&category=Laptops&page=1&limit=10&sortBy=price&sortOrder=asc"

Admin: POST /v1/api/admin/products/reindex

Frontend
--------

The React frontend has been updated to support the new filters in the products page UI (price range, promo toggle and views range). The API client in `src/util/api.js` sends these params to the backend so the UI and backend work together.

Protected — requires authentication + admin rights. This triggers a bulk reindex of all products into Elasticsearch.

Manual reindexing (CLI)
----------------------

You can manually reindex by running the helper script:

```powershell
# set these environment variables appropriately, then run
node ./src/scripts/reindex.js
```

Notes
-----

- The Product DB model does not currently store `views` or `promotion` fields; ES indexers use default values for these attributes. If you add these columns to the DB, the indexer will pick them up automatically.
- If `ELASTICSEARCH_URL` is not set, the server will continue to serve DB-backed queries (Sequelize) as before.
