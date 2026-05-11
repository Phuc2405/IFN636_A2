import { useEffect, useState, useRef, useCallback } from "react"; // Added useCallback
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";
import { Link } from "react-router-dom";

// Sub-component for handling the "Read More" logic only when necessary
const ReviewContent = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const element = contentRef.current;
    if (element) {
      // Check if actual content height exceeds the visible height (3 lines)
      setIsClamped(element.scrollHeight > element.clientHeight);
    }
  }, [content]);

  if (!content) return <span className="text-gray-600 italic">No content</span>;

  return (
    <div className="max-w-[22rem]">
      <p
        ref={contentRef}
        className={`${isExpanded ? "" : "line-clamp-3"} text-gray-300 leading-relaxed transition-all`}
      >
        {content}
      </p>
      {isClamped && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-orange-400 text-xs font-bold mt-2 hover:text-orange-300 transition-colors"
        >
          {isExpanded ? "Show Less" : "Read More"}
        </button>
      )}
    </div>
  );
};

function AdminPanel() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fix: Wrap fetchReviews in useCallback to prevent infinite loops
  // and satisfy the dependency requirements.
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/api/admin/reviews", {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      // Backend returns: { responseCode, description, status, totalReviews, data: [...] }
      // Transform data to match frontend format
      const transformReview = (r) => ({
        _id: r.reviewID,
        albumID: {
          title: r.albumTitle,
          artist: r.artist,
          coverImageUrl: r.coverImageUrl,
          id: r.albumID,
        },
        reviewRate: r.reviewRate,
        reviewContent: r.reviewContent,
        reviewDate: r.createdAt,
        updateAt: r.updateAt,
        userID: {
          nickname: r.user?.nickname,
          email: r.user?.email,
          type: r.user?.type,
        },
      });

      // Extract data array from response
      const reviewsData = Array.isArray(response.data) ? response.data : response.data?.data || [];

      const transformedReviews = reviewsData.map(transformReview);

      // Sort reviews by the most recent first
      const sortedReviews = transformedReviews.sort((a, b) => {
        const dateA = new Date(a.updateAt || a.reviewDate);
        const dateB = new Date(b.updateAt || b.reviewDate);
        return dateB - dateA;
      });

      setReviews(sortedReviews);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Cannot fetch reviews.");
    } finally {
      setLoading(false);
    }
  }, [user?.token]); // Function updates only if the user token changes

  const handleDelete = async (reviewID) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axiosInstance.delete(`/api/admin/reviews/${reviewID}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setReviews((prev) => prev.filter((r) => r._id !== reviewID));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete review");
    }
  };

  // Now you can safely include fetchReviews in the dependency array
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Format Date utility
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-800 border-t-orange-400 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-medium">Loading Admin Panel...</p>
      </div>
    );
  }

  if (error) return <div className="p-10 text-red-400 text-center font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-2 font-medium tracking-wide">
            Oversee all community feedback and manage user reviews.
          </p>
        </header>

        <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#121212] shadow-2xl shadow-black/60">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1a1a] text-gray-400 uppercase text-[10px] tracking-[0.15em] border-b border-gray-800">
                <th className="p-5 font-bold">Album</th>
                <th className="p-5 font-bold">User</th>
                <th className="p-5 font-bold text-center">Rating</th>
                <th className="p-5 font-bold">Review</th>
                <th className="p-5 font-bold">Update Date</th>
                <th className="p-5 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {reviews.map((r) => (
                <tr
                  key={r._id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-5 font-bold text-orange-400 text-sm uppercase tracking-tight">
                    <Link
                      to={`/albums/${r.albumID?.id}`}
                      className="flex-shrink-0"
                    >
                      {r.albumID?.title}
                    </Link>
                  </td>
                  <td className="p-5 text-gray-300 text-sm font-medium">{r.userID?.nickname}</td>
                  <td className="p-5 text-center">
                    <span className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-md border border-orange-500/20 font-bold text-xs">
                      {r.reviewRate} ★
                    </span>
                  </td>
                  <td className="p-5 align-top">
                    <ReviewContent content={r.reviewContent} />
                  </td>
                  <td className="p-5 text-gray-500 text-[11px] font-mono leading-tight">
                    {formatDate(r.updateAt || r.reviewDate)}
                  </td>
                  <td className="p-5 text-center">
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="bg-red-500/10 text-red-500 border border-red-500/20 px-5 py-2 rounded-full hover:bg-red-500 hover:text-white transition-all active:scale-95 text-[11px] font-bold uppercase tracking-wider"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reviews.length === 0 && (
            <div className="p-12 text-center text-gray-500 font-medium">No reviews found in the database.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
