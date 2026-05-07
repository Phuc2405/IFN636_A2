import { Link } from "react-router-dom";
import { useState } from "react";

import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [albums, setAlbums] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      try {
        setSearched(false);
        const response = await axiosInstance.get("/api/albums/search", {
          params: { q: searchTerm.trim() },
        });

        setAlbums(response.data.data ?? []);
        setSearched(true);
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.statusText ||
          error.message ||
          "Search failed. Please try again.";
        alert(message);
        return;
      }
    } else {
      setAlbums([]);
      setSearched(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#202124]  flex flex-col items-center justify-between font-sans text-white">
      <div className="flex-1"></div>

      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10 blur-[2px] pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1587731556938-38755b4803a6?auto=format&fit=crop&w=2000&q=80')`,
        }}
      ></div>

      {/* Felix music, small description and Searchbar*/}
      <div className="flex flex-col items-center w-full max-w-2xl px-6">
        <h1 className="text-5xl sm:text-7xl font-bold mb-6 tracking-wider text-center text-[#e8eaed]">FELIX MUSIC</h1>

        <p className="text-gray-400 text-center mb-8 text-sm sm:text-base px-4">
          Welcome to Felix Music. Find and share album reviews. Rate your favorite music, discover new artists, and join
          our vibrant community. Your perspective matters.
        </p>

        <form
          onSubmit={handleSearch}
          className="w-full"
        >
          <div className="relative flex items-center w-full h-14 rounded-full focus-within:bg-[#303134] bg-[#4d5156] border border-transparent hover:bg-[#303134] hover:border-gray-500 focus-within:border-gray-500 transition-all shadow-md">
            {/* Icon Search */}
            <div className="pl-5 pr-3 text-gray-400">
              <svg
                focusable="false"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-5 h-5 fill-current"
              >
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
              </svg>
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-white outline-none text-base pr-5"
              placeholder="Search album by title, artist..."
            />
          </div>

          <div className="flex justify-center mt-8">
            <button
              type="submit"
              className="bg-[#303134] text-[#e8eaed] text-sm px-6 py-2.5 rounded border border-transparent hover:border-gray-500 transition-colors"
            >
              Search
            </button>
          </div>

          {(searched || albums.length > 0) && (
            <div className="mt-10 w-full">
              <h2 className="text-2xl font-semibold mb-4 text-center">Search Results</h2>
              <ul className="space-y-4">
                {albums.length > 0 ? (
                  albums.map((album) => (
                    <li
                      key={album._id}
                      className="flex items-center p-4 bg-[#303134] rounded-lg shadow-md hover:bg-[#3a3a3a] transition-colors"
                    >
                      <img
                        src={album.coverImageUrl || "https://via.placeholder.com/150"}
                        alt={`${album.title} cover`}
                        className="w-16 h-16 object-cover rounded mr-4 float-left"
                      />
                      <div className="flex flex-col justify-center">
                        <h3 className="text-lg font-bold">{album.title}</h3>
                        <p className="text-gray-400">{album.artist}</p>
                        <p className="text-gray-400 text-sm">{album.releaseYear}</p>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No albums found. Try a different search term.</p>
                )}
              </ul>
            </div>
          )}
        </form>
      </div>

      <div className="flex-1"></div>

      {/* Footer encourage signup/login */}
      {!user && albums.length === 0 && (
        <div className="w-full max-w-3xl mb-12 px-6">
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-lg border border-yellow-400/30">
            <p className="text-white text-lg font-medium mb-1">Want to write a review?</p>
            <p className="text-yellow-100 text-sm mb-6">
              Join the community <span className="font-bold text-white">now</span>
            </p>

            <div className="flex gap-4 w-full sm:w-auto justify-center">
              <Link
                to="/register"
                className="flex-1 sm:flex-none bg-gray-100 text-gray-900 px-8 py-2.5 rounded-lg font-semibold hover:bg-white transition-colors text-center"
              >
                Signup
              </Link>
              <Link
                to="/login"
                className="flex-1 sm:flex-none bg-yellow-400 text-gray-900 px-8 py-2.5 rounded-lg font-semibold hover:bg-yellow-300 transition-colors text-center shadow-sm"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
