import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import BannerSlider from "../Component/BannerSliders/BannerSliderHome";
import PopularMobiles from "../Component/HomeComponents/PopularMobilesHome";
import PremiumPicks from "../Component/HomeComponents/PremiumPicksHome";
// import { GetProduct } from "../API/GetProducts";
import BannerOfferslider from "../Component/BannerSliders/BannerOfferslider";
import AboutUs from "../Component/HomeComponents/AboutUs";
import { AuthContext } from "../Context/AuthProvider";
import { getProducts } from "../services/ProductService";

export default function HomePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [homeProducts, sethomeProducts] = useState([]);
  const [featuredItems, setfeaturedItems] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === "Admin") {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    getProducts()
      .then((res) => {
   
        // Filter out inactive products
        const activeProducts = res.results.filter((product) => product.is_active);
        sethomeProducts(activeProducts);
        // Only use active products for featured items
        setfeaturedItems(activeProducts.slice(12, 16));
      })
      .catch((err) => console.log(err));
  }, [navigate]);

  return (
    <div className="bg-black text-white ">
      <BannerOfferslider />
      <BannerSlider />
      <PopularMobiles homeProducts={homeProducts} />
      <AboutUs />
      {/* Only show PremiumPicks if there are featured items */}
      {featuredItems.length > 0 && (
        <PremiumPicks featuredItems={featuredItems} />
      )}
    </div>
  );
}
