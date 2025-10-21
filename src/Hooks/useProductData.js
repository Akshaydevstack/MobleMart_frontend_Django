import { useState, useEffect, useCallback } from "react";
import debounce from "lodash.debounce";
import { getProducts } from "../services/ProductService";

export default function useProductData(selectedBrand, priceRange, searchQuery) {
  const [products, setProducts] = useState([]);
  const [upcomingProducts, setUpcomingProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const pageSize = 10; // DRF default page size

  const fetchProducts = useCallback(
    debounce(async (brandId, price, search, pageNumber = 1, append = false) => {
      setLoading(true);
      try {
        const res = await getProducts({
          brandId,
          priceGte: price[0],
          priceLte: price[1],
          search,
          ordering: "id",
          page: pageNumber,
        });

        const newProducts = res.results || [];
        setProducts(prev => (append ? [...prev, ...newProducts] : newProducts));
        setTotalPages(Math.ceil((res.count || 0) / pageSize));

        // Only update upcoming products on first page
        if (pageNumber === 1) {
          setUpcomingProducts(newProducts.slice(0, 6));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }, 400),
    []
  );

  // Fetch on filters/search change
  useEffect(() => {
    setPage(1);
    fetchProducts(selectedBrand?.id, priceRange, searchQuery, 1, false);
  }, [selectedBrand, priceRange, searchQuery]);

  const loadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(selectedBrand?.id, priceRange, searchQuery, nextPage, true);
    }
  };

  return {
    products,
    upcomingProducts,
    loading,
    totalPages,
    page,
    loadMore,
  };
}