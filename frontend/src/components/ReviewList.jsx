import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";

const ReviewList = ({ reviews, setReviews, setEditingReview }) => {
  const { user } = useAuth();

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await axiosInstance.delete(`/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setReviews(reviews.filter((review) => review._id !== reviewId));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete review.");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {reviews.length === 0 ? (
        <p className="text-gray-500 italic text-center py-10">No reviews found.</p>
      ) : (
        [...reviews]
          .sort((a, b) => {
            const dateB = new Date(b.updateAt || b.reviewDate).getTime();
            const dateA = new Date(a.updateAt || a.reviewDate).getTime();
            return dateB - dateA;
          })
          .map((review) => (
            <div
              key={review._id}
              className="bg-[#121212] p-5 rounded-2xl border border-gray-800 flex flex-col sm:flex-row gap-5 shadow-md"
            >
              <Link
                to={`/albums/${review.albumID?._id}`}
                className="flex-shrink-0"
              >
                <img
                  src={review.albumID?.coverImageUrl}
                  className="w-24 h-24 rounded-lg object-cover hover:opacity-80 transition"
                  alt="Album Cover"
                  referrerPolicy="no-referrer"
                />
              </Link>

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <Link to={`/albums/${review.albumID?._id}`}>
                      <h4 className="font-bold text-lg text-orange-500 truncate hover:underline">
                        {review.albumID?.title}
                      </h4>
                    </Link>

                    <p className="text-sm text-gray-500">{review.albumID?.artist}</p>
                  </div>

                  <span className="text-xs text-gray-600 font-bold whitespace-nowrap ml-4">
                    {new Date(review.updateAt || review.reviewDate).toLocaleString()}
                  </span>
                </div>

                <div className="text-orange-500 text-sm mb-3">
                  {"★".repeat(review.reviewRate)}
                  {"☆".repeat(5 - review.reviewRate)}
                </div>

                <p
                  className="text-gray-300 leading-relaxed italic mb-4 flex-1 overflow-hidden text-ellipsis whitespace-pre-wrap"
                  style={{
                    overflowWrap: "break-word",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    maxHeight: "4.5rem",
                  }}
                >
                  "{review.reviewContent}"
                </p>

                <div className="flex gap-4 justify-end mt-auto border-t border-gray-800/50 pt-4">
                  <button
                    onClick={() => setEditingReview(review)}
                    className="bg-[#1a1a1a] text-gray-300 text-sm font-bold px-5 py-2 rounded-lg hover:bg-orange-500 hover:text-white transition-all"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(review._id)}
                    className="text-red-500 text-sm font-bold px-5 py-2 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
      )}
    </div>
  );
};

export default ReviewList;
