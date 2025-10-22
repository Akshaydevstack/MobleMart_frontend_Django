import axios from "axios";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useCart from "../Hooks/useCart";
import { FiShoppingCart, FiStar, FiUser } from "react-icons/fi";
import { toast } from "react-hot-toast";
import LoaderPage from "../Component/LoaderPage";
import { getProductById } from "../services/ProductService";
import api from "../API/axios";

export default function ProductDetailsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { cart, addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const { id } = useParams();
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));

  // Review state
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const fetchProduct = async () => {
    try {
      const res = await getProductById(id);
      setProduct(res);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch product.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/?product_id=${id}`);
      setReviews(res.data.results || []);
      console.log(res.data.results);
    } catch (err) {
      console.log("Failed to fetch reviews:", err);
      toast.error("Failed to load reviews");
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();
    fetchReviews();
  }, [id]);

  const images = product
    ? Array.isArray(product.images)
      ? product.images
      : [product.images]
    : [];

  const isInCart = product
    ? cart.items.some((item) => item.product?.id === product.id)
    : false;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!storedUser) {
      navigate("/login");
      return;
    }
    try {
      await addToCart(product);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!storedUser) {
      navigate("/login");
      return;
    }

    if (!reviewComment.trim()) {
      toast.error("Please write a review comment");
      return;
    }

    setReviewLoading(true);
    try {
      const res = await api.post("/reviews/create/", {
        product: product.id,
        rating: parseInt(reviewRating),
        comment: reviewComment.trim(),
      });

      toast.success("Review added successfully!");

      // Add new review to the list
      const newReview = {
        ...res.data,
        created_at: new Date().toISOString(),
      };

      setReviews((prev) => [newReview, ...prev]);
      setReviewComment("");
      setReviewRating(5);
    } catch (err) {
      console.log("Review submission error:", err);
      if (err.response?.data) {
        Object.values(err.response.data).forEach((error) => {
          toast.error(typeof error === "string" ? error : error[0]);
        });
      } else {
        toast.error("Failed to add review. Please try again.");
      }
    } finally {
      setReviewLoading(false);
    }
  };

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : 0;

  // Star rating display component
  const StarRating = ({ rating, size = "text-lg" }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`${size} ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-400"
            }`}
          />
        ))}
        <span className="text-gray-300 ml-1">({rating})</span>
      </div>
    );
  };

  if (loading) return <LoaderPage />;

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
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full max-w-md aspect-square overflow-hidden rounded-2xl border border-gray-700 relative">
              {product.count === 0 && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                  Out of Stock
                </div>
              )}
              {product.count > 0 && product.count < 10 && (
                <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold z-10">
                  Only {product.count} left!
                </div>
              )}

              <img
                src={images[currentImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>

            {images.length > 1 && (
              <div className="flex flex-wrap justify-center gap-3">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImage === index
                        ? "border-yellow-400 ring-2 ring-yellow-400 ring-opacity-50"
                        : "border-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {product.name}
              </h1>
              <p className="text-2xl sm:text-3xl text-yellow-400 font-semibold mb-4">
                ₹{product.price}
              </p>

              {/* Rating Summary */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <StarRating rating={parseFloat(averageRating)} />
                  <span className="text-gray-400 text-sm">
                    ({reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>
              </div>

              <p className="text-gray-300 text-lg leading-relaxed">
                {product.description ||
                  "Premium product with sleek design and top-notch features."}
              </p>
            </div>

            {/* Stock Status */}
            {product.count === 0 ? (
              <div className="text-red-400 font-semibold text-lg">
                Out of stock
              </div>
            ) : product.count < 10 ? (
              <div className="text-yellow-400 font-semibold text-lg">
                Only {product.count} left in stock!
              </div>
            ) : (
              <div className="text-green-400 font-semibold text-lg">
                In Stock
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {product.count > 0 ? (
                <>
                  {isInCart ? (
                    <button
                      onClick={() => navigate("/cart")}
                      className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 text-lg font-semibold"
                    >
                      <FiShoppingCart className="text-xl" />
                      <span>Go to Cart</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 text-lg font-semibold"
                    >
                      Add to Cart
                    </button>
                  )}
                </>
              ) : (
                <button
                  disabled
                  className="bg-gray-600 text-gray-400 px-8 py-3 rounded-full cursor-not-allowed text-lg font-semibold"
                >
                  Out of Stock
                </button>
              )}

              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 text-yellow-400 hover:text-yellow-300 border border-yellow-400 hover:border-yellow-300 rounded-full transition-all duration-300 font-semibold"
              >
                ← Back to Products
              </button>
            </div>

            {/* Product Details */}
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Product Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Brand:</span>
                  <p className="text-white font-medium">
                    {product.brand?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Category:</span>
                  <p className="text-white font-medium">
                    {product.category?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">SKU:</span>
                  <p className="text-white font-medium">
                    {product.sku || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Warranty:</span>
                  <p className="text-white font-medium">
                    {product.warranty || "1 Year"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-gray-900 rounded-3xl border border-gray-700 p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Add Review Form */}
            <div className="lg:w-1/3">
              <h2 className="text-2xl font-bold text-white mb-6">
                Write a Review
              </h2>

              {storedUser ? (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">
                      Your Rating
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-2xl transition-transform hover:scale-110"
                        >
                          <FiStar
                            className={`${
                              star <= reviewRating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-400"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-gray-400 text-sm">
                      {reviewRating} out of 5 stars
                    </span>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">
                      Your Review
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      rows="4"
                      required
                      className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {reviewLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <FiUser className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">
                    Please login to write a review
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 rounded-full font-semibold transition-all"
                  >
                    Login to Review
                  </button>
                </div>
              )}
            </div>

            {/* Reviews List */}
            <div className="lg:w-2/3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Customer Reviews ({reviews.length})
                </h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Average Rating:</span>
                    <StarRating rating={parseFloat(averageRating)} />
                  </div>
                )}
              </div>

              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <FiStar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No reviews yet</p>
                  <p className="text-gray-500 text-sm">
                    Be the first to review this product!
                  </p>
                </div>
              ) : (
                <div className="space-y-6 max-h-96 overflow-y-auto pr-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                            <FiUser className="text-black text-lg" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">
                              {review.username || "Anonymous"}
                            </p>
                            <StarRating rating={review.rating} size="text-md" />
                          </div>
                        </div>
                        <span className="text-gray-500 text-sm">
                          {new Date(review.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
