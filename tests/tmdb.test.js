/**
 * Tests for tmdb.js
 * Tests TMDB API integration with mocked axios calls
 */

// Mock dotenv to prevent loading .env file
jest.mock("dotenv", () => ({
    config: jest.fn(),
}));

// Set test environment variables BEFORE requiring tmdb
process.env.TMDB_API_KEY = "test_api_key";
process.env.TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const axios = require("axios");

// Mock axios
jest.mock("axios");

// Now require tmdb (it will use test environment variables)
const tmdb = require("../src/services/tmdb");

describe("TMDB Service", () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe("searchMovies", () => {
        test("should return array of movie results on successful search", async () => {
            const mockResponse = {
                data: {
                    results: [
                        {
                            id: 550,
                            title: "Fight Club",
                            release_date: "1999-10-15",
                            poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                        },
                        {
                            id: 551,
                            title: "Fight Club 2",
                            release_date: "2000-01-01",
                            poster_path: null,
                        },
                    ],
                },
            };

            axios.get.mockResolvedValue(mockResponse);

            const results = await tmdb.searchMovies("Fight Club");

            expect(axios.get).toHaveBeenCalledWith(
                "https://api.themoviedb.org/3/search/movie",
                {
                    params: {
                        api_key: "test_api_key",
                        query: "Fight Club",
                        language: "en-US",
                        page: 1,
                        include_adult: false,
                    },
                }
            );

            expect(results).toHaveLength(2);
            expect(results[0].id).toBe(550);
            expect(results[0].title).toBe("Fight Club");
        });

        test("should return empty array on API error", async () => {
            axios.get.mockRejectedValue(new Error("API Error"));

            const results = await tmdb.searchMovies("NonexistentMovie");

            expect(results).toEqual([]);
        });

        test("should handle empty search results", async () => {
            const mockResponse = {
                data: {
                    results: [],
                },
            };

            axios.get.mockResolvedValue(mockResponse);

            const results = await tmdb.searchMovies("xyzabc123nonexistent");

            expect(results).toEqual([]);
        });

        test("should pass correct query parameter", async () => {
            const mockResponse = {
                data: {
                    results: [],
                },
            };

            axios.get.mockResolvedValue(mockResponse);

            await tmdb.searchMovies("The Matrix");

            expect(axios.get).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    params: expect.objectContaining({
                        query: "The Matrix",
                    }),
                })
            );
        });
    });

    describe("getMovieDetails", () => {
        test("should return formatted movie details with all fields", async () => {
            const mockResponse = {
                data: {
                    id: 550,
                    title: "Fight Club",
                    release_date: "1999-10-15",
                    vote_average: 8.433,
                    overview: "A ticking-time-bomb insomniac...",
                    runtime: 139,
                    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                    genres: [
                        {id: 18, name: "Drama"},
                        {id: 53, name: "Thriller"},
                    ],
                    credits: {
                        cast: [
                            {name: "Edward Norton"},
                            {name: "Brad Pitt"},
                            {name: "Helena Bonham Carter"},
                            {name: "Meat Loaf"},
                            {name: "Jared Leto"},
                            {name: "Zach Grenier"}, // 6th actor, should not be included
                        ],
                        crew: [
                            {name: "David Fincher", job: "Director"},
                            {name: "Jim Uhls", job: "Screenplay"},
                        ],
                    },
                    videos: {
                        results: [
                            {
                                type: "Trailer",
                                site: "YouTube",
                                key: "SUXWAEX2jlg",
                            },
                        ],
                    },
                    external_ids: {
                        imdb_id: "tt0137523",
                    },
                },
            };

            axios.get.mockResolvedValue(mockResponse);

            const movie = await tmdb.getMovieDetails("550");

            expect(axios.get).toHaveBeenCalledWith(
                "https://api.themoviedb.org/3/movie/550",
                {
                    params: {
                        api_key: "test_api_key",
                        language: "en-US",
                        append_to_response: "credits,videos,external_ids",
                    },
                }
            );

            expect(movie).toEqual({
                id: 550,
                title: "Fight Club",
                year: "1999",
                rating: "8.4",
                plot: "A ticking-time-bomb insomniac...",
                genres: "Drama, Thriller",
                genreIds: [18, 53],
                cast: "Edward Norton, Brad Pitt, Helena Bonham Carter, Meat Loaf, Jared Leto",
                director: "David Fincher",
                runtime: "139 min",
                posterUrl:
                    "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                trailerUrl: "https://www.youtube.com/watch?v=SUXWAEX2jlg",
                tmdbUrl: "https://www.themoviedb.org/movie/550",
                imdbUrl: "https://www.imdb.com/title/tt0137523",
            });
        });

        test("should handle missing cast and crew data", async () => {
            const mockResponse = {
                data: {
                    id: 550,
                    title: "Fight Club",
                    release_date: "1999-10-15",
                    vote_average: 8.433,
                    overview: "Plot here",
                    runtime: 139,
                    poster_path: "/poster.jpg",
                    genres: [],
                    credits: {
                        cast: [],
                        crew: [],
                    },
                    videos: {
                        results: [],
                    },
                    external_ids: {},
                },
            };

            axios.get.mockResolvedValue(mockResponse);

            const movie = await tmdb.getMovieDetails("550");

            expect(movie.cast).toBe("N/A");
            expect(movie.director).toBe("N/A");
            expect(movie.trailerUrl).toBe(null);
            expect(movie.imdbUrl).toBe(null);
        });

        test("should handle missing optional fields gracefully", async () => {
            const mockResponse = {
                data: {
                    id: 999,
                    title: "Test Movie",
                    // Missing: release_date, vote_average, overview, runtime, poster_path, etc.
                    genres: null,
                },
            };

            axios.get.mockResolvedValue(mockResponse);

            const movie = await tmdb.getMovieDetails("999");

            expect(movie.year).toBe("N/A");
            expect(movie.rating).toBe("N/A");
            expect(movie.plot).toBe("No plot available.");
            expect(movie.runtime).toBe("N/A");
            expect(movie.posterUrl).toBe(null);
            expect(movie.genres).toBe("N/A");
            expect(movie.genreIds).toEqual([]);
        });

        test("should return only top 5 cast members", async () => {
            const mockResponse = {
                data: {
                    id: 550,
                    title: "Fight Club",
                    release_date: "1999-10-15",
                    vote_average: 8.4,
                    overview: "Plot",
                    runtime: 139,
                    genres: [],
                    credits: {
                        cast: [
                            {name: "Actor 1"},
                            {name: "Actor 2"},
                            {name: "Actor 3"},
                            {name: "Actor 4"},
                            {name: "Actor 5"},
                            {name: "Actor 6"},
                            {name: "Actor 7"},
                            {name: "Actor 8"},
                        ],
                        crew: [],
                    },
                },
            };

            axios.get.mockResolvedValue(mockResponse);

            const movie = await tmdb.getMovieDetails("550");

            expect(movie.cast).toBe("Actor 1, Actor 2, Actor 3, Actor 4, Actor 5");
            expect(movie.cast).not.toContain("Actor 6");
        });

        test("should find Director from crew array", async () => {
            const mockResponse = {
                data: {
                    id: 550,
                    title: "Fight Club",
                    release_date: "1999-10-15",
                    vote_average: 8.4,
                    overview: "Plot",
                    runtime: 139,
                    genres: [],
                    credits: {
                        cast: [],
                        crew: [
                            {name: "Producer Name", job: "Producer"},
                            {name: "Director Name", job: "Director"},
                            {name: "Writer Name", job: "Writer"},
                        ],
                    },
                },
            };

            axios.get.mockResolvedValue(mockResponse);

            const movie = await tmdb.getMovieDetails("550");

            expect(movie.director).toBe("Director Name");
        });

        test("should find YouTube trailer from videos array", async () => {
            const mockResponse = {
                data: {
                    id: 550,
                    title: "Fight Club",
                    release_date: "1999-10-15",
                    vote_average: 8.4,
                    overview: "Plot",
                    runtime: 139,
                    genres: [],
                    credits: {cast: [], crew: []},
                    videos: {
                        results: [
                            {type: "Teaser", site: "YouTube", key: "teaser123"},
                            {type: "Trailer", site: "YouTube", key: "trailer456"},
                            {type: "Clip", site: "YouTube", key: "clip789"},
                        ],
                    },
                },
            };

            axios.get.mockResolvedValue(mockResponse);

            const movie = await tmdb.getMovieDetails("550");

            expect(movie.trailerUrl).toBe("https://www.youtube.com/watch?v=trailer456");
        });

        test("should ignore non-YouTube videos", async () => {
            const mockResponse = {
                data: {
                    id: 550,
                    title: "Fight Club",
                    release_date: "1999-10-15",
                    vote_average: 8.4,
                    overview: "Plot",
                    runtime: 139,
                    genres: [],
                    credits: {cast: [], crew: []},
                    videos: {
                        results: [
                            {type: "Trailer", site: "Vimeo", key: "vimeo123"},
                            {type: "Teaser", site: "YouTube", key: "teaser456"},
                        ],
                    },
                },
            };

            axios.get.mockResolvedValue(mockResponse);

            const movie = await tmdb.getMovieDetails("550");

            expect(movie.trailerUrl).toBe(null); // No YouTube Trailer found
        });

        test("should format runtime correctly", async () => {
            const mockResponse = {
                data: {
                    id: 550,
                    title: "Fight Club",
                    release_date: "1999-10-15",
                    vote_average: 8.4,
                    overview: "Plot",
                    runtime: 95,
                    genres: [],
                    credits: {cast: [], crew: []},
                },
            };

            axios.get.mockResolvedValue(mockResponse);

            const movie = await tmdb.getMovieDetails("550");

            expect(movie.runtime).toBe("95 min");
        });

        test("should format rating to 1 decimal place", async () => {
            const mockResponse = {
                data: {
                    id: 550,
                    title: "Fight Club",
                    release_date: "1999-10-15",
                    vote_average: 8.43295,
                    overview: "Plot",
                    runtime: 139,
                    genres: [],
                    credits: {cast: [], crew: []},
                },
            };

            axios.get.mockResolvedValue(mockResponse);

            const movie = await tmdb.getMovieDetails("550");

            expect(movie.rating).toBe("8.4");
        });

        test("should extract year from release_date", async () => {
            const mockResponse = {
                data: {
                    id: 550,
                    title: "Fight Club",
                    release_date: "1999-10-15",
                    vote_average: 8.4,
                    overview: "Plot",
                    runtime: 139,
                    genres: [],
                    credits: {cast: [], crew: []},
                },
            };

            axios.get.mockResolvedValue(mockResponse);

            const movie = await tmdb.getMovieDetails("550");

            expect(movie.year).toBe("1999");
        });

        test("should build correct TMDB and IMDB URLs", async () => {
            const mockResponse = {
                data: {
                    id: 550,
                    title: "Fight Club",
                    release_date: "1999-10-15",
                    vote_average: 8.4,
                    overview: "Plot",
                    runtime: 139,
                    genres: [],
                    credits: {cast: [], crew: []},
                    external_ids: {
                        imdb_id: "tt0137523",
                    },
                },
            };

            axios.get.mockResolvedValue(mockResponse);

            const movie = await tmdb.getMovieDetails("550");

            expect(movie.tmdbUrl).toBe("https://www.themoviedb.org/movie/550");
            expect(movie.imdbUrl).toBe("https://www.imdb.com/title/tt0137523");
        });

        test("should return null on API error", async () => {
            axios.get.mockRejectedValue(new Error("Movie not found"));

            const movie = await tmdb.getMovieDetails("999999");

            expect(movie).toBe(null);
        });

        test("should handle network errors gracefully", async () => {
            axios.get.mockRejectedValue(new Error("Network Error"));

            const movie = await tmdb.getMovieDetails("550");

            expect(movie).toBe(null);
        });
    });

    describe("Integration - searchMovies and getMovieDetails", () => {
        test("should be able to search and then get details", async () => {
            // Mock search response
            const searchMockResponse = {
                data: {
                    results: [
                        {
                            id: 550,
                            title: "Fight Club",
                            release_date: "1999-10-15",
                        },
                    ],
                },
            };

            // Mock details response
            const detailsMockResponse = {
                data: {
                    id: 550,
                    title: "Fight Club",
                    release_date: "1999-10-15",
                    vote_average: 8.433,
                    overview: "An insomniac office worker...",
                    runtime: 139,
                    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                    genres: [{id: 18, name: "Drama"}],
                    credits: {
                        cast: [{name: "Edward Norton"}],
                        crew: [{name: "David Fincher", job: "Director"}],
                    },
                    videos: {
                        results: [
                            {
                                type: "Trailer",
                                site: "YouTube",
                                key: "SUXWAEX2jlg",
                            },
                        ],
                    },
                    external_ids: {
                        imdb_id: "tt0137523",
                    },
                },
            };

            axios.get
                .mockResolvedValueOnce(searchMockResponse)
                .mockResolvedValueOnce(detailsMockResponse);

            // Search for movie
            const searchResults = await tmdb.searchMovies("Fight Club");
            expect(searchResults).toHaveLength(1);

            // Get details using ID from search
            const movieId = searchResults[0].id.toString();
            const details = await tmdb.getMovieDetails(movieId);

            expect(details.title).toBe("Fight Club");
            expect(details.year).toBe("1999");
            expect(details.director).toBe("David Fincher");
        });
    });
});
