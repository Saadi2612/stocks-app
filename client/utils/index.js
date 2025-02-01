const serverUrl = `${process.env.BACKEND_URL}`;

const BASE_URL = serverUrl ?? "http://127.0.0.1:8000";

export const fetchData = async (endpoint, options = {}) => {
  // console.log(endpoint);
  try {
    const response = await fetch(BASE_URL + endpoint, {
      next: { revalidate: 30 },
      ...options,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching data on server:", error);
    throw error;
  }
};
