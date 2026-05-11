import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";

const ReviewForm = ({
  reviews,
  setReviews,
  editingReview,
  setEditingReview,
  onFormClose,
}) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    reviewRate: 5,
    reviewContent: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  useEffect(() => {
    if (editingReview) {
      setSelectedAlbum(editingReview.albumID);
      setFormData({
        reviewRate: editingReview.reviewRate,
        reviewContent: editingReview.reviewContent,
      });
      setSearchTerm("");
    }
  }, [editingReview]);

  useEffect(() => {
    if (searchTerm.trim().length < 1 || selectedAlbum || editingReview) {
      setSearchResults([]);
      return;
    }

    const searchAlbums = async () => {
      try {
        const response = await axiosInstance.get("/api/albums/search", {
          params: { q: searchTerm },
        });
        setSearchResults(response.data.data || []);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      }
    };

    searchAlbums();
  }, [searchTerm, selectedAlbum, editingReview]);

  const handleSelectAlbum = (album) => {
    setSelectedAlbum(album);
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleReset = () => {
    setEditingReview(null);
    setSelectedAlbum(null);
    setFormData({ reviewRate: 5, reviewContent: "" });
    setSearchTerm("");
    if (onFormClose) {
      onFormClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAlbum && !editingReview)
      return alert("Please select an album first!");
    if (!formData.reviewContent.trim())
      return alert("Please write your comment!");

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      // Helper function to transform backend response to frontend format
      const transformReview = (backendData, albumInfo) => ({
        _id: backendData.reviewID,
        albumID: albumInfo,
        reviewRate: backendData.reviewRate,
        reviewContent: backendData.reviewContent,
        reviewDate: backendData.createdAt || backendData.reviewDate,
        updateAt: backendData.updateAt,
      });

      if (editingReview) {
        const response = await axiosInstance.put(
          `/api/reviews/${editingReview._id}`,
          formData,
          config,
        );
        // Backend returns: { responseCode, description, status, data: {...} }
        const transformedReview = transformReview(
          response.data.data || response.data,
          editingReview.albumID,
        );
        setReviews(
          reviews.map((rev) =>
            rev._id === transformedReview._id ? transformedReview : rev,
          ),
        );
      } else {
        const response = await axiosInstance.post(
          "/api/reviews",
          {
            ...formData,
            albumTitle: selectedAlbum.title,
            artistName: selectedAlbum.artist,
          },
          config,
        );
        // Backend returns: { responseCode, description, status, data: {...} }
        const transformedReview = transformReview(
          response.data.data || response.data,
          selectedAlbum,
        );
        setReviews([transformedReview, ...reviews]);
      }
      handleReset();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save review.");
    }
  };

  return (
    <div className="w-full mb-12">
      <form
        onSubmit={handleSubmit}
        className="bg-[#121212] p-8 shadow-xl border-y sm:border sm:rounded-2xl border-gray-800 text-white w-full"
      >
        <h2 className="text-2xl font-bold mb-8 text-orange-500 border-b border-gray-800 pb-4">
          {editingReview ? "Edit Your Review" : "Write a New Review"}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Step 1: Select Album
            </label>

            {selectedAlbum ? (
              <div className="flex items-center gap-4 p-4 bg-[#1a1a1a] border border-orange-500/30 rounded-xl relative">
                <img
                  src={selectedAlbum.coverImageUrl}
                  className="w-16 h-16 rounded-md object-cover shadow-md"
                  alt=""
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-lg truncate">
                    {selectedAlbum.title}
                  </p>
                  <p className="text-sm text-gray-400 truncate">
                    {selectedAlbum.artist}
                  </p>
                </div>
                {!editingReview && (
                  <button
                    type="button"
                    onClick={() => setSelectedAlbum(null)}
                    className="absolute top-2 right-3 text-gray-500 hover:text-red-500 font-bold text-xl"
                  >
                    ✕
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search album (e.g., 'Eternal')..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-4 bg-[#1a1a1a] border border-gray-800 rounded-xl outline-none focus:border-orange-500 transition-colors placeholder:text-gray-600"
                />

                {searchResults.length > 0 && (
                  <div className="absolute top-[60px] left-0 right-0 bg-[#1a1a1a] border border-gray-800 rounded-xl z-50 overflow-hidden shadow-2xl max-h-60 overflow-y-auto">
                    {searchResults.map((album) => (
                      <div
                        key={album._id}
                        onClick={() => handleSelectAlbum(album)}
                        className="p-3 hover:bg-orange-500/20 cursor-pointer flex items-center gap-3 border-b border-gray-800 last:border-0"
                      >
                        <img
                          src={album.coverImageUrl}
                          className="w-10 h-10 rounded object-cover"
                          alt=""
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-sm truncate">
                            {album.title}
                          </p>
                          <p className="text-gray-500 text-xs truncate">
                            {album.artist}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Step 2: Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData({ ...formData, reviewRate: s })}
                    className={`text-2xl transition-transform active:scale-90 outline-none ${s <= formData.reviewRate ? "text-orange-500" : "text-gray-800 hover:text-gray-600"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Step 3: Comment
            </label>
            <textarea
              placeholder="What did you think about this album?"
              value={formData.reviewContent}
              onChange={(e) =>
                setFormData({ ...formData, reviewContent: e.target.value })
              }
              className="w-full p-4 bg-[#1a1a1a] border border-gray-800 rounded-xl outline-none focus:border-orange-500 h-[80px] resize-none transition-all placeholder:text-gray-600 mb-6"
            />

            <div className="flex gap-4 mt-auto">
              <button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95"
              >
                {editingReview ? "Update Review" : "Post Review"}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-8 py-3 bg-[#1a1a1a] border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors font-bold active:scale-95"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
