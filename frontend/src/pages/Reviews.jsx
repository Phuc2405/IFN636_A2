import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";

const Reviews = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [isWritingNew, setIsWritingNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  // 1. Create a ref to anchor the form location for smooth scrolling
  const formSectionRef = useRef(null);

  useEffect(() => {
    if (location.state?.notice) {
      setNotice(location.state.notice);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Fetch user's own reviews and sort them by newest first
  useEffect(() => {
    if (!user?.token) {
      console.log("No token found, skipping fetch");
      return;
    }
    console.log(
      "Fetching reviews with token:",
      user.token?.substring(0, 20) + "...",
    );
    let isMounted = true;

    const fetchReviews = async () => {
      try {
        const response = await axiosInstance.get("/api/reviews", {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        if (isMounted) {
          // Helper function to transform backend response to frontend format
          const transformReview = (r) => ({
            _id: r.reviewID,
            albumID: {
              title: r.albumTitle,
              artist: r.artist,
              coverImageUrl: r.coverImageUrl,
            },
            reviewRate: r.reviewRate,
            reviewContent: r.reviewContent,
            reviewDate: r.createdAt,
            updateAt: r.updateAt,
          });

          // Backend returns: { responseCode, description, status, totalReviews, data: [...] }
          // Extract data array and transform each review
          console.log("Raw response:", response.data);
          const reviewsData = Array.isArray(response.data)
            ? response.data
            : response.data?.data || [];
          console.log("Reviews data:", reviewsData);

          const transformedReviews = reviewsData.map(transformReview);
          console.log("Transformed reviews:", transformedReviews);

          // SORTING LOGIC: Newest date at the top
          const sortedData = transformedReviews.sort((a, b) => {
            return (
              new Date(b.updateAt || b.reviewDate) -
              new Date(a.updateAt || a.reviewDate)
            );
          });
          setReviews(sortedData);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch user reviews:", error);
          console.error("Error response:", error.response);
          console.error("Error status:", error.response?.status);
          console.error("Error data:", error.response?.data);
          setReviews([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, [user?.token]);

  // 2. Function to handle smooth scrolling
  const scrollToForm = () => {
    // Timeout ensures the DOM has rendered the form before scrolling
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setIsWritingNew(false);
  };

  // 3. Triggered when clicking "+ Write a Review"
  const handleWriteNewClick = () => {
    setIsWritingNew(true);
    setEditingReview(null);
    scrollToForm();
  };

  // 4. Triggered when clicking "Edit" in ReviewList
  const handleEditClick = (review) => {
    setEditingReview(review);
    setIsWritingNew(false);
    scrollToForm();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4">
      <div className="w-full max-w-5xl mx-auto">
        {user && (
          <div className="mb-6 flex justify-start">
            <p className="text-xl text-gray-300 font-medium tracking-wide">
              Hi,{" "}
              <span className="text-orange-400 font-bold">
                {user.nickname || "there"}
              </span>
              !
            </p>
          </div>
        )}

        {notice && (
          <div className="mb-6 bg-red-600/20 border border-red-500 rounded-lg p-4 text-red-100">
            <p className="font-semibold">{notice}</p>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
            Music Reviews
          </h1>
          <p className="text-gray-400">
            Share your thoughts on your favorite albums
          </p>
        </div>

        {/* Write New Review Button */}
        {user && !isWritingNew && !editingReview && (
          <div className="mb-8 flex justify-center">
            <button
              onClick={handleWriteNewClick}
              className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-95"
            >
              + Write a Review
            </button>
          </div>
        )}

        {/* 5. Ref used to scroll back to form for editing or writing */}
        <div ref={formSectionRef}>
          {(isWritingNew || editingReview) && (
            <div className="mb-12">
              <ReviewForm
                reviews={reviews}
                setReviews={setReviews}
                editingReview={editingReview}
                setEditingReview={setEditingReview}
                onFormClose={handleCancelEdit}
              />
            </div>
          )}
        </div>

        {/* Reviews List Section */}
        <div>
          <h2 className="text-2xl font-bold text-orange-500 mb-6 border-b border-gray-800 pb-4">
            {loading ? "Loading Reviews..." : `All Reviews (${reviews.length})`}
          </h2>
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading...</p>
          ) : (
            <ReviewList
              reviews={reviews}
              setReviews={setReviews}
              setEditingReview={handleEditClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
