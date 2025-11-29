import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Row,
  Col,
  Card,
  Select,
  Input,
  Button,
  Spin,
  Empty,
  Space,
  Pagination,
  Rate,
  Tag,
} from "antd";
import { SearchOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { getProductsApi, getCategoriesApi } from "../util/api";
import "./products.css";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 12,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    category: null,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [viewMode, setViewMode] = useState("pagination"); // 'pagination' or 'infinite'
  const [infiniteProducts, setInfiniteProducts] = useState([]);
  const [infinitePage, setInfinitePage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategoriesApi();
        if (response?.EC === 0) {
          setCategories(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products for pagination mode
  const fetchPaginationProducts = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const response = await getProductsApi(
          page,
          pagination.pageSize,
          filters.category,
          filters.search || null,
          filters.sortBy,
          filters.sortOrder
        );

        if (response?.EC === 0) {
          setProducts(response.data);
          setPagination({
            currentPage: response.pagination.currentPage,
            pageSize: pagination.pageSize,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          });
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.pageSize]
  );

  // Fetch products for infinite scroll mode
  const fetchInfiniteProducts = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const response = await getProductsApi(
          page,
          12,
          filters.category,
          filters.search || null,
          filters.sortBy,
          filters.sortOrder
        );

        if (response?.EC === 0) {
          if (page === 1) {
            setInfiniteProducts(response.data);
          } else {
            setInfiniteProducts((prev) => [...prev, ...response.data]);
          }
          setHasMore(response.pagination.hasMore);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (viewMode !== "infinite") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setInfinitePage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [viewMode, hasMore, loading]);

  // Load more when infinite page changes
  useEffect(() => {
    if (viewMode === "infinite" && infinitePage > 1) {
      fetchInfiniteProducts(infinitePage);
    }
  }, [infinitePage, viewMode, fetchInfiniteProducts]);

  // Fetch initial products when filters change or view mode changes
  useEffect(() => {
    if (viewMode === "pagination") {
      fetchPaginationProducts(1);
    } else {
      setInfinitePage(1);
      fetchInfiniteProducts(1);
    }
  }, [filters, viewMode, fetchPaginationProducts, fetchInfiniteProducts]);

  const handleCategoryChange = (value) => {
    setFilters((prev) => ({ ...prev, category: value || null }));
  };

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleSortChange = (value) => {
    setFilters((prev) => ({ ...prev, sortBy: value }));
  };

  const handleSortOrderChange = (value) => {
    setFilters((prev) => ({ ...prev, sortOrder: value }));
  };

  const handlePageChange = (page) => {
    fetchPaginationProducts(page);
  };

  const ProductCard = ({ product }) => (
    <Card
      hoverable
      cover={
        product.image ? (
          <img
            alt={product.name}
            src={product.image}
            style={{ height: "200px", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              height: "200px",
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span>No Image</span>
          </div>
        )
      }
      style={{ height: "100%" }}
    >
      <Card.Meta
        title={
          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {product.name}
          </div>
        }
        description={
          <div>
            <Tag color="blue" style={{ marginBottom: "8px" }}>
              {product.category}
            </Tag>
            <div style={{ marginBottom: "8px", minHeight: "40px" }}>
              {product.description && (
                <p style={{ marginBottom: "4px", color: "#666", fontSize: "12px" }}>
                  {product.description.substring(0, 60)}...
                </p>
              )}
            </div>
            <div style={{ marginBottom: "8px" }}>
              <Rate value={product.rating} disabled readOnly style={{ fontSize: "12px" }} />
              <span style={{ marginLeft: "8px", fontSize: "12px", color: "#999" }}>
                ({product.totalReviews})
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "18px", fontWeight: "bold", color: "#1890ff" }}>
                ${product.price}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: product.stock > 0 ? "#52c41a" : "#ff4d4f",
                }}
              >
                {product.stock > 0 ? `Stock: ${product.stock}` : "Out of Stock"}
              </span>
            </div>
            <Button
              type="primary"
              block
              icon={<ShoppingCartOutlined />}
              style={{ marginTop: "8px" }}
              disabled={product.stock <= 0}
            >
              Add to Cart
            </Button>
          </div>
        }
      />
    </Card>
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "20px" }}>Sản phẩm</h1>

      {/* Filters */}
      <Card style={{ marginBottom: "20px" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Chọn danh mục"
              allowClear
              onChange={handleCategoryChange}
              style={{ width: "100%" }}
              options={[
                { label: "Tất cả danh mục", value: null },
                ...categories.map((cat) => ({
                  label: cat,
                  value: cat,
                })),
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm kiếm sản phẩm"
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={handleSearchChange}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Sắp xếp theo"
              value={filters.sortBy}
              onChange={handleSortChange}
              style={{ width: "100%" }}
              options={[
                { label: "Mới nhất", value: "createdAt" },
                { label: "Giá", value: "price" },
                { label: "Tên", value: "name" },
                { label: "Đánh giá", value: "rating" },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Thứ tự"
              value={filters.sortOrder}
              onChange={handleSortOrderChange}
              style={{ width: "100%" }}
              options={[
                { label: "Giảm dần", value: "desc" },
                { label: "Tăng dần", value: "asc" },
              ]}
            />
          </Col>
        </Row>

        {/* View Mode Toggle */}
        <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
          <Col xs={24}>
            <Space>
              <span>Chế độ xem:</span>
              <Button
                type={viewMode === "pagination" ? "primary" : "default"}
                onClick={() => setViewMode("pagination")}
              >
                Phân trang
              </Button>
              <Button
                type={viewMode === "infinite" ? "primary" : "default"}
                onClick={() => setViewMode("infinite")}
              >
                Tải vô hạn
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Products Grid */}
      <Spin spinning={loading && products.length === 0}>
        {viewMode === "pagination" ? (
          <>
            {products.length > 0 ? (
              <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
                {products.map((product) => (
                  <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="Không có sản phẩm" />
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Row justify="center" style={{ marginTop: "20px" }}>
                <Pagination
                  current={pagination.currentPage}
                  total={pagination.total}
                  pageSize={pagination.pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </Row>
            )}
          </>
        ) : (
          <>
            {infiniteProducts.length > 0 ? (
              <Row gutter={[16, 16]}>
                {infiniteProducts.map((product) => (
                  <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="Không có sản phẩm" />
            )}

            {/* Infinite Scroll Observer */}
            <div ref={observerTarget} style={{ padding: "20px", textAlign: "center" }}>
              {loading && <Spin />}
              {!hasMore && infiniteProducts.length > 0 && (
                <p style={{ color: "#999" }}>Không còn sản phẩm</p>
              )}
            </div>
          </>
        )}
      </Spin>
    </div>
  );
};

export default ProductsPage;
