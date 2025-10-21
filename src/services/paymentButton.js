import api from "../API/axios";

const PaymentButton = () => {
  const handlePayment = async () => {
    try {
      // Step 1: Create order from backend
      const { data: order } = await api.post("create-order/", {
        amount: 500, // in rupees
      });

      // Step 2: Configure Razorpay options
      const options = {
        key: "rzp_test_RVoZd9UTCaOnZS", // 🟢 from Razorpay Dashboard (Test Key)
        amount: order.amount,
        currency: order.currency,
        name: "Bridgeon Store",
        description: "Test Transaction",
        order_id: order.id, // 🔑 the one you just got from backend
        handler: function (response) {
          console.log("Payment Successful!", response);
          alert("Payment successful!");
          // 🧩 (Optional) Send response to backend for verification
        },
        prefill: {
          name: "Akshay Bharathan",
          email: "akshay@example.com",
          contact: "9876543210",
        },
        theme: {
          color: "#F37254",
        },
      };

      // Step 3: Open Razorpay payment window
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Something went wrong");
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition"
    >
      Pay ₹500
    </button>
  );
};

export default PaymentButton;