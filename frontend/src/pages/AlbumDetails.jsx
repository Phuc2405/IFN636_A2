import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";

const AlbumDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [album, setAlbum] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);

  const [reviewRate, setReviewRate] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const authHeader = {
    headers: { Authorization: `Bearer ${user?.token}` },
  };

  const fetchAlbumPageData = async () => {
    try {
      setLoading(true);

      const [albumRes, reviewsRes, myReviewRes] = await Promise.all([
        axiosInstance.get(`/api/albums/${id}`, authHeader),
        axiosInstance.get(`/api/reviews/album/${id}`, authHeader),
        axiosInstance.get(`/api/reviews/album/${id}/my-review`, authHeader),
      ]);

      setAlbum(albumRes.data.data);
      setReviews(reviewsRes.data);
      setMyReview(myReviewRes.data);

      if (myReviewRes.data) {
        setReviewRate(myReviewRes.data.reviewRate);
        setReviewContent(myReviewRes.data.reviewContent);
      }
    } catch (error) {
      console.error("Album detail error:", error);
      setError("Failed to load album details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchAlbumPageData();
    }
  }, [id, user?.token]);

  const resetForm = () => {
    setReviewRate(5);
    setReviewContent("");
    setIsEditing(false);
    setShowForm(false);
  };

  const handleWriteReview = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post(
        "/api/reviews",
        {
          albumID: id,
          reviewRate,
          reviewContent,
        },
        authHeader
      );

      await fetchAlbumPageData();
      resetForm();
    } catch (error) {
      console.error("Write review error:", error);
      alert(error.response?.data?.message || "Failed to write review.");
    }
  };

  const handleEditReview = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.put(
        `/api/reviews/${myReview._id}`,
        {
          reviewRate,
          reviewContent,
        },
        authHeader
      );

      await fetchAlbumPageData();
      setIsEditing(false);
      setShowForm(false);
    } catch (error) {
      console.error("Edit review error:", error);
      alert(error.response?.data?.message || "Failed to update review.");
    }
  };

  const handleDeleteMyReview = async () => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;

    try {
      await axiosInstance.delete(`/api/reviews/${myReview._id}`, authHeader);
      await fetchAlbumPageData();
      resetForm();
    } catch (error) {
      console.error("Delete review error:", error);
      alert(error.response?.data?.message || "Failed to delete review.");
    }
  };

  const handleAdminDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await axiosInstance.delete(`/api/admin/reviews/${reviewId}`, authHeader);
      await fetchAlbumPageData();
      alert("Review deleted successfully.");
    } catch (error) {
      console.error("Admin delete error:", error);
      alert(error.response?.data?.message || "Failed to delete review.");
    }
  };

  if (loading) {
    return <div className="text-white text-center mt-10">Loading album details...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!album) {
    return <div className="text-gray-400 text-center mt-10">Album not found.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <section className="bg-[#121212] border border-gray-800 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 mb-8">
          <img
            src={album.coverImageUrl}
            alt={album.title}
            className="w-48 h-48 object-cover rounded-xl"
            referrerPolicy="no-referrer"
          />

          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-orange-500">{album.title}</h1>
            <p className="text-gray-400 text-lg mt-2">{album.artist}</p>
          </div>
        </section>

        <section className="bg-[#121212] border border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">My Review</h2>

          {!myReview && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-orange-500 text-white font-bold px-5 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Write Review
            </button>
          )}

          {myReview && !isEditing && (
            <div className="border border-gray-800 rounded-xl p-4">
              <div className="text-orange-500 mb-2">
                {"★".repeat(myReview.reviewRate)}
                {"☆".repeat(5 - myReview.reviewRate)}
              </div>

              <p className="text-gray-300 whitespace-pre-wrap mb-4">{myReview.reviewContent}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setReviewRate(myReview.reviewRate);
                    setReviewContent(myReview.reviewContent);
                    setIsEditing(true);
                    setShowForm(true);
                  }}
                  className="bg-[#1a1a1a] text-gray-300 text-sm font-bold px-5 py-2 rounded-lg hover:bg-orange-500 hover:text-white transition"
                >
                  Edit
                </button>

                <button
                  onClick={handleDeleteMyReview}
                  className="text-red-500 text-sm font-bold px-5 py-2 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          {showForm && (
            <form
              onSubmit={isEditing ? handleEditReview : handleWriteReview}
              className="flex flex-col gap-4 mt-4"
            >
              <label className="text-sm text-gray-400">
                Rating
                <select
                  value={reviewRate}
                  onChange={(e) => setReviewRate(Number(e.target.value))}
                  className="block mt-2 bg-black border border-gray-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value={1}>1 Star</option>
                  <option value={2}>2 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
              </label>

              <label className="text-sm text-gray-400">
                Review
                <textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  required
                  rows="5"
                  className="block mt-2 w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
              </label>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-orange-500 text-white font-bold px-5 py-2 rounded-lg hover:bg-orange-600 transition"
                >
                  {isEditing ? "Save Changes" : "Submit Review"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-[#1a1a1a] text-gray-300 font-bold px-5 py-2 rounded-lg hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="bg-[#121212] border border-gray-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Community Reviews</h2>

          {reviews.length === 0 ? (
            <p className="text-gray-500 italic">No community reviews yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="border border-gray-800 rounded-xl p-4"
                >
                  <div className="flex justify-between gap-4 mb-2">
                    <div>
                      <p className="font-bold text-orange-500">{review.userID?.nickname || "Unknown user"}</p>

                      <div className="text-orange-500 text-sm">
                        {"★".repeat(review.reviewRate)}
                        {"☆".repeat(5 - review.reviewRate)}
                      </div>
                    </div>

                    <span className="text-xs text-gray-600">
                      {new Date(review.updateAt || review.reviewDate).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-gray-300 whitespace-pre-wrap">{review.reviewContent}</p>

                  {user?.type === "admin" && (
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => handleAdminDeleteReview(review._id)}
                        className="text-red-500 text-sm font-bold px-5 py-2 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AlbumDetails;
