import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";

const getReviewDateValue = (review) =>
  review.updateAt || review.updatedAt || review.reviewDate || review.createdAt || 0;

const sortReviewsByNewest = (items = []) =>
  [...items].sort((a, b) => {
    const dateB = new Date(getReviewDateValue(b)).getTime();
    const dateA = new Date(getReviewDateValue(a)).getTime();

    return dateB - dateA;
  });

const formatReviewDate = (review) => {
  const dateValue = getReviewDateValue(review);

  if (!dateValue) {
    return "Unknown date";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString();
};

const AlbumDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const authHeader = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    }),
    [user?.token]
  );

  const sortedReviews = useMemo(() => sortReviewsByNewest(reviews), [reviews]);

  const ratingStats = useMemo(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach((review) => {
      const rating = Number(review.reviewRate);

      if (distribution[rating] !== undefined) {
        distribution[rating] += 1;
      }
    });

    const totalReviews = reviews.length;
    const totalScore = reviews.reduce((sum, review) => sum + Number(review.reviewRate || 0), 0);

    const averageRating = totalReviews === 0 ? 0 : Number((totalScore / totalReviews).toFixed(1));

    return { distribution, totalReviews, averageRating };
  }, [reviews]);

  const renderStars = (rating) => {
    const roundedRating = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));

    return (
      <>
        {"★".repeat(roundedRating)}
        {"☆".repeat(5 - roundedRating)}
      </>
    );
  };

  const fetchAlbumPageData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [albumRes, reviewsRes] = await Promise.all([
        axiosInstance.get(`/api/albums/${id}`),
        axiosInstance.get(`/api/reviews/album/${id}`),
      ]);

      const albumData = albumRes.data?.data || null;
      setAlbum(albumData);

      const reviewData = reviewsRes.data?.data || reviewsRes.data || [];
      setReviews(sortReviewsByNewest(Array.isArray(reviewData) ? reviewData : []));

      if (user?.token) {
        const myReviewRes = await axiosInstance.get(`/api/reviews/album/${id}/my-review`, authHeader);

        const myReviewData = myReviewRes.data?.data || myReviewRes.data || null;
        setMyReview(myReviewData);

        if (myReviewData) {
          setReviewRate(myReviewData.reviewRate);
          setReviewContent(myReviewData.reviewContent);
        }
      } else {
        setMyReview(null);
      }
    } catch (error) {
      console.error("Album detail error:", error.response?.data || error);
      setError(
        error.response?.data?.description ||
          error.response?.data?.message ||
          error.message ||
          "Failed to load album details."
      );
    } finally {
      setLoading(false);
    }
  }, [id, user?.token, authHeader]);

  useEffect(() => {
    fetchAlbumPageData();
  }, [fetchAlbumPageData]);

  const resetForm = () => {
    setReviewRate(5);
    setReviewContent("");
    setIsEditing(false);
    setShowForm(false);
  };

  const handleWriteReviewClick = () => {
    if (!user?.token) {
      navigate("/login");
      return;
    }

    setShowForm(true);
  };

  const handleWriteReview = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post(
        "/api/reviews",
        {
          albumTitle: album.title,
          artistName: album.artist,
          reviewRate,
          reviewContent,
        },
        authHeader
      );

      await fetchAlbumPageData();
      resetForm();
    } catch (error) {
      console.error("Write review error:", error.response?.data || error);
      alert(error.response?.data?.description || error.response?.data?.message || "Failed to write review.");
    }
  };

  const handleEditReview = async (e) => {
    e.preventDefault();

    if (!myReview?._id) {
      return;
    }

    try {
      await axiosInstance.put(
        `/api/reviews/${myReview._id}`,
        {
          reviewRate,
          reviewContent,
        },
        authHeader
      );

      setIsEditing(false);
      setShowForm(false);
      await fetchAlbumPageData();
    } catch (error) {
      console.error("Edit review error:", error.response?.data || error);
      alert(error.response?.data?.description || error.response?.data?.message || "Failed to update review.");
    }
  };

  const handleDeleteMyReview = async () => {
    if (!myReview?._id) {
      return;
    }

    if (!window.confirm("Are you sure you want to delete your review?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/reviews/${myReview._id}`, authHeader);

      setMyReview(null);
      setReviewRate(5);
      setReviewContent("");
      setIsEditing(false);
      setShowForm(false);

      await fetchAlbumPageData();
    } catch (error) {
      console.error("Delete review error:", error.response?.data || error);
      alert(error.response?.data?.description || error.response?.data?.message || "Failed to delete review.");
    }
  };

  const handleAdminDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/admin/reviews/${reviewId}`, authHeader);
      await fetchAlbumPageData();
      alert("Review deleted successfully.");
    } catch (error) {
      console.error("Admin delete error:", error.response?.data || error);
      alert(error.response?.data?.description || error.response?.data?.message || "Failed to delete review.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-800 border-t-orange-400 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-medium">Loading album details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
        <p className="text-red-400 text-center font-bold">{error}</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
        <p className="text-red-400 text-center font-bold">Album not found.</p>
      </div>
    );
  }

  const trackList = album.tracks || album.trackList || [];

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">
          Album Detail: <span className="text-orange-500">{album.title}</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10">
          <aside>
            <img
              src={album.coverImageUrl || "https://via.placeholder.com/400"}
              alt={album.title}
              className="w-full rounded-xl object-cover shadow-lg mb-7"
              referrerPolicy="no-referrer"
            />

            <div className="bg-[#121212] border border-gray-800 rounded-xl p-5 mb-8">
              <p className="text-xs tracking-[0.25em] text-gray-500 font-bold mb-2">ARTIST</p>
              <p className="mb-6">{album.artist}</p>

              <p className="text-xs tracking-[0.25em] text-gray-500 font-bold mb-2">RELEASE YEAR</p>
              <p>{album.releaseYear || "Not listed"}</p>
            </div>

            {trackList.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold">Tracklist</h2>
                  <div className="h-px bg-gray-800 flex-1"></div>
                </div>

                <ol className="text-gray-400">
                  {trackList.map((track, index) => (
                    <li
                      key={`${track}-${index}`}
                      className="py-3 border-b border-gray-900"
                    >
                      {index + 1}. {typeof track === "string" ? track : track.title}
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </aside>

          <main>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-10 border-b border-gray-800 pb-8 mb-8">
              <div>
                <p className="text-xs tracking-[0.25em] text-gray-500 font-bold mb-5">COMMUNITY RATING</p>

                <div className="text-4xl text-orange-500 mb-3">{renderStars(ratingStats.averageRating)}</div>

                <p className="text-gray-300 font-bold">{ratingStats.averageRating}/5</p>
                <p className="text-gray-500 text-sm">{ratingStats.totalReviews} total reviews</p>
              </div>

              <div>
                <p className="text-xs tracking-[0.25em] text-gray-500 font-bold mb-5">RATING DISTRIBUTION</p>

                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingStats.distribution[rating];
                  const percentage =
                    ratingStats.totalReviews === 0 ? 0 : Math.round((count / ratingStats.totalReviews) * 100);

                  return (
                    <div
                      key={rating}
                      className="flex items-center gap-4 mb-3"
                    >
                      <div className="text-orange-500 w-24 text-sm">
                        {"★".repeat(rating)}
                        <span className="text-gray-700">{"★".repeat(5 - rating)}</span>
                      </div>

                      <div className="flex-1 h-2 bg-[#171717] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>

                      <span className="text-gray-500 text-sm w-10 text-right">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mb-10">
              {!myReview && !showForm && (
                <button
                  onClick={handleWriteReviewClick}
                  className="w-full bg-orange-500 text-white font-bold px-5 py-4 rounded-full hover:bg-orange-600 transition shadow-lg"
                >
                  ✎ Write a Review
                </button>
              )}

              {showForm && (
                <form
                  onSubmit={isEditing ? handleEditReview : handleWriteReview}
                  className="bg-[#121212] p-8 shadow-xl border-y sm:border sm:rounded-2xl border-gray-800 text-white w-full mt-8"
                >
                  <h2 className="text-2xl font-bold mb-8 text-orange-500 border-b border-gray-800 pb-4">
                    {isEditing ? "Edit Your Review" : "Write Review"}
                  </h2>

                  <div className="flex flex-col gap-6 max-w-xl">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                          Step 2: Rating
                        </label>

                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRate(star)}
                              className={`text-2xl transition-transform active:scale-90 outline-none ${
                                star <= reviewRate ? "text-orange-500" : "text-gray-800 hover:text-gray-600"
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">
                        Step 3: Comment
                      </label>

                      <textarea
                        placeholder="What did you think about this album?"
                        value={reviewContent}
                        onChange={(e) => setReviewContent(e.target.value)}
                        required
                        className="w-full p-4 bg-[#1a1a1a] border border-gray-800 rounded-xl outline-none focus:border-orange-500 h-[120px] resize-none transition-all placeholder:text-gray-600"
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="flex-1 bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95"
                      >
                        {isEditing ? "Update Review" : "Submit Review"}
                      </button>

                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-8 py-3 bg-[#1a1a1a] border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors font-bold active:scale-95"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </section>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-bold">User Feed</h2>
                <div className="h-px bg-gray-800 flex-1"></div>
              </div>

              {sortedReviews.length === 0 ? (
                <p className="text-gray-500 italic">No community reviews yet.</p>
              ) : (
                <div className="flex flex-col">
                  {sortedReviews.map((review) => {
                    const isMyReview = myReview?._id === review._id;

                    return (
                      <div
                        key={review._id}
                        className="border-b border-gray-900 py-6"
                      >
                        <div className="flex justify-between gap-4 mb-2">
                          <div>
                            <p className="font-bold">
                              {review.userID?.nickname ||
                                review.userID?.name ||
                                review.user?.nickname ||
                                review.user?.name ||
                                "Unknown user"}
                            </p>

                            <p className="text-xs text-gray-500">{formatReviewDate(review)}</p>
                          </div>

                          <div className="text-orange-500 text-sm whitespace-nowrap">
                            {renderStars(review.reviewRate)}
                          </div>
                        </div>

                        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{review.reviewContent}</p>

                        <div className="flex justify-end gap-3 mt-4">
                          {isMyReview && (
                            <>
                              <button
                                onClick={() => {
                                  setReviewRate(myReview.reviewRate);
                                  setReviewContent(myReview.reviewContent);
                                  setIsEditing(true);
                                  setShowForm(true);
                                }}
                                className="bg-[#1a1a1a] hover:bg-gray-800 text-gray-300 px-5 py-2 rounded-lg font-bold transition-colors"
                              >
                                Edit
                              </button>

                              <button
                                onClick={handleDeleteMyReview}
                                className="bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/30 text-red-500 px-5 py-2 rounded-lg font-bold transition-colors"
                              >
                                Delete
                              </button>
                            </>
                          )}

                          {user?.type === "admin" && !isMyReview && (
                            <button
                              onClick={() => handleAdminDeleteReview(review._id)}
                              className="text-red-500 text-sm font-bold px-5 py-2 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AlbumDetails;
