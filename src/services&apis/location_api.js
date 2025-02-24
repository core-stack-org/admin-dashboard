export const fetchStates = async () => {
  try {
    const response = await fetch(
      `https://geoserver.core-stack.org/api/v1/get_states/`,
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          "ngrok-skip-browser-warning": "420",
        },
      }
    );
    const data = await response.json();
    return data.states;
  } catch (error) {
    console.error("Error fetching states:", error);
    throw error;
  }
};

export const fetchDistricts = async (apiUrl, stateId) => {
  try {
    const url = `${apiUrl}/api/v1/get_districts/${stateId}/`;
    console.log("Districts API URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "420",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Districts Response Data:", data);
    return data.districts;
  } catch (error) {
    console.error("Error fetching districts:", error);
    throw error;
  }
};

export const fetchBlocks = async (selectedDistrict) => {
  try {
    const response = await fetch(
      `https://geoserver.core-stack.org/api/v1/get_blocks/${selectedDistrict}/`,
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          "ngrok-skip-browser-warning": "420",
        },
      }
    );
    const data = await response.json();
    return data.blocks;
  } catch (error) {
    console.error("Error fetching blocks:", error);
    throw error;
  }
};
