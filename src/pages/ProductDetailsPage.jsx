import axios from "axios";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GetProduct } from "../API/GetProducts";
import useCart from "../Hooks/useCart";
import { FiShoppingCart } from "react-icons/fi";
import { toast } from "react-hot-toast";
import LoaderPage from "../Component/LoaderPage";
import { getProductById } from "../services/ProductService";
export default function ProductDetailsPage() {
  const { cart, addToCart } = useCart();
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const { id } = useParams();
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    window.scrollTo(0, 0);
    getProductById(id)
      .then((res) => {
        setProduct(res);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);


  const images = product
    ? Array.isArray(product.images)
      ? product.images
      : [product.images]
    : [];

  const isInCart = product
    ? cart.items.some((item) => item.id === product.id)
    : false;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!storedUser) {
      navigate("/login");
      return;
    }
    try {
      await addToCart(product);
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  if (loading) {
    return (
    <LoaderPage/>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <h2 className="text-2xl mb-4">Product not found</h2>
        <button
          onClick={() => navigate(-1)}
          className="bg-yellow-400 text-black px-6 py-2 rounded-full hover:bg-yellow-300 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

 return (
  <div className="min-h-[70vh] md:min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] px-4 py-4 sm:py-10">
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 md:gap-10 p-3 sm:p-6 md:p-8 rounded-xl md:rounded-3xl border border-gray-700 backdrop-blur-md bg-gray-900/60 shadow-md md:shadow-2xl">
      {/* Images Section */}
      <div className="flex flex-col items-center space-y-2 sm:space-y-4 w-full relative">
        {/* Stock Status Badges */}
        {product.count === 0 && (
          <div className="absolute top-2 sm:top-6 left-2 sm:left-6 bg-red-600 text-white px-2 py-0.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-sm font-bold z-10">
            Out of Stock
          </div>
        )}
        {product.count > 0 && product.count < 10 && (
          <div className="absolute top-2 sm:top-6 left-2 sm:left-6 bg-yellow-500 text-black px-2 py-0.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-sm font-bold z-10">
            Limited Stock
          </div>
        )}

        {/* Main Image - Made smaller for mobile */}
        <div className="w-full max-w-[280px] sm:max-w-md aspect-square overflow-hidden rounded-lg sm:rounded-2xl border border-gray-700">
          <img
            src={images[currentImage]}
            alt={product.name}
            className="w-full h-full object-cover transition hover:scale-105 duration-300"
          />
        </div>

        {/* Thumbnails - Made smaller and tighter for mobile */}
        {images.length > 1 && (
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-3">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-10 h-10 sm:w-16 sm:h-16 rounded-md sm:rounded-lg overflow-hidden border-2 transition ${
                  currentImage === index
                    ? "border-yellow-400"
                    : "border-gray-700"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info Section - Compact for mobile */}
      <div className="flex flex-col justify-center space-y-3 sm:space-y-6 w-full text-center lg:text-left">
        <h2 className="text-xl sm:text-3xl md:text-4xl text-white font-bold">
          {product.name}
        </h2>
        <p className="text-md sm:text-xl md:text-2xl text-yellow-400 font-semibold">
          ₹{product.price}
        </p>
        
        {/* Description with limited lines on mobile */}
        <p className="text-gray-300 text-xs sm:text-sm md:text-base max-w-xl mx-auto lg:mx-0 line-clamp-3 sm:line-clamp-none">
          {product.description ||
            "Premium product with sleek design and top-notch features."}
        </p>

        {/* Stock Status Message */}
        {product.count === 0 ? (
          <div className="text-red-400 font-semibold py-1 sm:py-3 text-xs sm:text-base">
            Out of stock
          </div>
        ) : product.count < 10 ? (
          <div className="text-yellow-400 font-semibold py-1 sm:py-3 text-xs sm:text-base">
            Only {product.count} left!
          </div>
        ) : null}

        {/* Action Buttons - More compact */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center lg:justify-start">
          {product.count > 0 ? (
            <>
              {isInCart ? (
                <button
                  onClick={() => navigate("/cart")}
                  className="bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 sm:px-8 sm:py-3 rounded-full transition hover:scale-105 flex items-center justify-center gap-1 text-xs sm:text-base"
                >
                  <FiShoppingCart className="text-sm sm:text-lg" />
                  <span>Go to Cart</span>
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-1.5 sm:px-8 sm:py-3 rounded-full transition hover:scale-105 text-xs sm:text-base"
                >
                  Add to Cart
                </button>
              )}
              <button
                onClick={() => navigate(-1)}
                className="text-[11px] sm:text-sm text-yellow-400 hover:underline mt-0.5 sm:mt-0"
              >
                ← Back to Products
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-600 text-gray-300 px-4 py-1.5 sm:px-8 sm:py-3 rounded-full cursor-not-allowed text-xs sm:text-base"
              disabled
            >
              Out of Stock
            </button>
          )}
        </div>

        {/* Additional Product Details - Smaller and more compact */}
        <div className="pt-2 sm:pt-4 border-t border-gray-700">
          <h3 className="text-sm sm:text-lg font-semibold text-white mb-1">
            Details
          </h3>
          <ul className="text-gray-300 text-[11px] sm:text-sm space-y-0.5">
            <li>
              <span className="font-medium">Brand:</span>{" "}
              {product.brand.name || "N/A"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
)}