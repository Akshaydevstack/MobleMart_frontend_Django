import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BrandFilter from "../Component/ShopComponents/BrandFilter";
import PriceFilter from "../Component/ShopComponents/PriceFilter";
import ProductGrid from "../Component/ShopComponents/OurMobileCollection";
import UpcomingProducts from "../Component/ShopComponents/UpcomingProducts";
import { getProducts } from "../services/ProductService";
import FeaturedMobileVideo from "../Component/ShopComponents/FeaturedMobileVideo";
import UpcomingProductVideo from "../Component/ShopComponents/Upcomingvidoe";
import LoaderPage from "../Component/LoaderPage";
import debounce from "lodash.debounce";

export default function ShopPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]); // all fetched products
  const [upcomingProducts, setUpcomingProducts] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState({ id: null, name: "All" });
  const [priceRange, setPriceRange] = useState([10000, 200000]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Fetch products with debounce (append for Load More)
  const fetchProducts = useCallback(
    debounce(async (brandId, priceRange, search, pageNumber, append = false) => {
      setLoading(true);
      try {
        const res = await getProducts(
          {
            brandId,
            priceGte: priceRange[0],
            priceLte: priceRange[1],
            search,
            ordering: "id",
            page: pageNumber,
          }
        );

        // Append or replace products
        setProducts((prev) =>
          append ? [...prev, ...(res.results || res)] : (res.results || res)
        );

        // Set total pages
        setTotalPages(res.total_pages || 1);

        // Update upcoming products (can pick latest 6 for example)
        setUpcomingProducts((res.results || res).slice(10, 16));
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  // Reset products when filters/search change
  useEffect(() => {
    setPage(1);
    fetchProducts(selectedBrand.id, priceRange, searchQuery, 1, false);
  }, [selectedBrand, priceRange, searchQuery]);

  // Load more products
  const loadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(selectedBrand.id, priceRange, searchQuery, nextPage, true);
    }
  };

  if (loading && page === 1) return <LoaderPage />;

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Filters */}
      <div className="bg-gray-900 py-2 border-b border-gray-800 z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-between">
          <button
            className="md:hidden bg-gray-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-700 transition"
            onClick={() => setOpen(!open)}
          >
            {open ? "Hide Filters" : "Show Filters"}
          </button>

          <div className="hidden md:flex gap-6 items-center w-full justify-between">
            <BrandFilter
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
            />
            <PriceFilter priceRange={priceRange} setPriceRange={setPriceRange} />
            <div className="text-gray-400 text-sm">{products.length} products found</div>
          </div>

          <div className={`md:hidden overflow-hidden transition-all duration-500 ${open ? "max-h-96 py-4" : "max-h-0"}`}>
            <div className="flex flex-col gap-4">
              <BrandFilter selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand} />
              <PriceFilter priceRange={priceRange} setPriceRange={setPriceRange} />
              <div className="text-gray-400 text-sm">{products.length} products found</div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <ProductGrid
        products={products}
        navigate={navigate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Load More button */}
      {page < totalPages && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            className="px-6 py-3 rounded-full bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition"
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
 
      <FeaturedMobileVideo />

      {upcomingProducts.length > 0 && (
        <>
          <UpcomingProducts upcomingProducts={upcomingProducts} />
          <UpcomingProductVideo />
        </>
      )}
    </div>
  );
}