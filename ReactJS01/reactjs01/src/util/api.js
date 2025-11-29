import axios from "./axios.customize";

const createUserApi = (name, email, password) => {
  const URL_API = "/v1/api/register";
  const data = { name, email, password };
  return axios.post(URL_API, data);
};

const loginApi = (email, password) => {
  const URL_API = "/v1/api/login";
  const data = { email, password };
  return axios.post(URL_API, data);
};

const getUserApi = () => {
  const URL_API = "/v1/api/user";
  return axios.get(URL_API);
};

// Product APIs
const getProductsApi = (page = 1, limit = 10, category = null, search = null, sortBy = "createdAt", sortOrder = "desc") => {
  const URL_API = "/v1/api/products";
  const params = new URLSearchParams({
    page,
    limit,
  });
  
  if (category) params.append("category", category);
  if (search) params.append("search", search);
  if (sortBy) params.append("sortBy", sortBy);
  if (sortOrder) params.append("sortOrder", sortOrder);
  
  return axios.get(`${URL_API}?${params.toString()}`);
};

const getProductByIdApi = (id) => {
  const URL_API = `/v1/api/products/${id}`;
  return axios.get(URL_API);
};

const getCategoriesApi = () => {
  const URL_API = "/v1/api/products/categories";
  return axios.get(URL_API);
};

const createProductApi = (productData) => {
  const URL_API = "/v1/api/admin/products";
  return axios.post(URL_API, productData);
};

const updateProductApi = (id, productData) => {
  const URL_API = `/v1/api/admin/products/${id}`;
  return axios.put(URL_API, productData);
};

const deleteProductApi = (id) => {
  const URL_API = `/v1/api/admin/products/${id}`;
  return axios.delete(URL_API);
};

export { 
  createUserApi, 
  loginApi, 
  getUserApi, 
  getProductsApi, 
  getProductByIdApi, 
  getCategoriesApi,
  createProductApi,
  updateProductApi,
  deleteProductApi
};
