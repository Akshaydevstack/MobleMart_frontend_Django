import React, { useEffect, useState } from "react";
import api from "../../API/axios"; // your axios instance

export default function BrandFilter({ selectedBrand, setSelectedBrand }) {
  const [brands, setBrands] = useState([{ id: null, name: "All" }]); // default "All"

  // Fetch brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await api.get("brands/"); // your brands API
        // Map to {id, name} and prepend "All"
        const brandOptions = [{ id: null, name: "All" }, ...res.data.results.map(b => ({ id: b.id, name: b.name }))];
        setBrands(brandOptions);
      } catch (err) {
        console.error("Failed to fetch brands:", err.response?.data || err.message);
      }
    };
    fetchBrands();
  }, []);

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Brand</h3>
      <div className="flex flex-wrap gap-2">
        {brands.map((brand) => (
          <button
            key={brand.id ?? brand.name}
            type="button" // prevent form submit
            onClick={() => setSelectedBrand(brand)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedBrand.id === brand.id
                ? "bg-yellow-400 text-black"
                : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            {brand.name}
          </button>
        ))}
      </div>
    </div>
  );
}