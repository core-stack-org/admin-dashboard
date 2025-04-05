import { useState, useEffect } from "react";

const climateOptions = {
  annualPrecipitation: {
    label: "Annual Precipitation (mm)",
    options: [
      "<400",
      "400-600",
      "600-740",
      "740-860",
      "860-1000",
      "1000-1100",
      "1100-1250",
      "1250-1440",
      "1440-2000",
      ">2000",
    ],
  },
  meanAnnualTemperature: {
    label: "Mean Annual Temperature (°C)",
    options: [
      "<5",
      "5-10",
      "10-15",
      "15-20",
      "20-22",
      "22-24",
      "24-26",
      "26-28",
      "28-30",
      ">30",
    ],
  },
  aridityIndex: {
    label: "Aridity Index",
    description:
      "This is the ratio of precipitation to potential evapotranspiration (PET), where PET is calculated using the Penman-Monteith equation.",
    options: ["<0.05", "0.05-0.20", "0.20-0.50", "0.50-0.65", ">0.65"],
  },
  referenceEvapoTranspiration: {
    label: "Reference Evapotranspiration (mm/day)",
    description:
      "This is the maximum of actual evapotranspiration based on current land-use, or actual projected evapotranspiration for the crop/tree to be planted.",
    options: ["0-2", "2-4", "4-6", "6-8", "8-10", ">10"],
  },
};

const soilOptions = {
  topsoilPH: {
    label: "Topsoil pH",
    options: [
      "<4.5",
      "4.5-5.5",
      "5.5-6",
      "6-6.5",
      "6.5-7",
      "7-7.5",
      "7.5-8.5",
      "8.5-9",
      ">9",
    ],
  },
  subsoilPH: {
    label: "Subsoil pH",
    options: [
      "<4.5",
      "4.5-5.5",
      "5.5-6",
      "6-6.5",
      "6.5-7",
      "7-7.5",
      "7.5-8.5",
      "8.5-9",
      ">9",
    ],
  },
  topsoilOC: {
    label: "Topsoil Organic Carbon (% weight)",
    options: [
      "<0.5",
      "0.5-0.7",
      "0.7-1",
      "1-1.2",
      "1.2-1.5",
      "1.5-2",
      "2-2.5",
      "2.5-3",
      "3-3.5",
      ">3",
    ],
  },
  subsoilOC: {
    label: "Subsoil Organic Carbon (% weight)",
    options: [
      "<0.1",
      "0.1-0.2",
      "0.2-0.4",
      "0.4-0.6",
      "0.6-0.8",
      "0.8-1",
      "1-1.5",
      "1.5-2",
      "2-2.5",
      ">2.5",
    ],
  },
  topsoilCEC: {
    label: "Topsoil Cation Exchange Capacity (cmol/kg)",
    options: [
      "0-5",
      "5-10",
      "10-15",
      "15-20",
      "20-25",
      "25-35",
      "35-45",
      ">45",
    ],
  },
  subsoilCEC: {
    label: "Subsoil Cation Exchange Capacity (cmol/kg)",
    options: [
      "0-5",
      "5-10",
      "10-15",
      "15-20",
      "20-25",
      "25-35",
      "35-45",
      ">45",
    ],
  },
  topsoilTexture: {
    label: "Topsoil Texture",
    description:
      "Please select the appropriate soil texture based on the given legend.",
    options: ["Coarse", "Medium", "Fine"],
  },
  subsoilTexture: {
    label: "Subsoil Texture",
    options: [
      "Clay (heavy)",
      "Silty clay",
      "Clay",
      "Silty clay loam",
      "Clay loam",
      "Silt",
      "Silt loam",
      "Sandy clay",
      "Loam",
      "Sandy clay loam",
      "Sandy loam",
      "Loamy sand",
      "Sand",
    ],
  },
  topsoilBD: {
    label: "Topsoil Bulk Density (kg/dm³)",
    options: [
      "<1.1",
      "1.1-1.3",
      "1.3-1.35",
      "1.35-1.40",
      "1.40-1.45",
      "1.45-1.5",
      "1.5-1.6",
      "1.6-1.7",
      ">1.7",
    ],
  },
  subsoilBD: {
    label: "Subsoil Bulk Density (kg/dm³)",
    options: [
      "<1.3",
      "1.3-1.35",
      "1.35-1.4",
      "1.4-1.45",
      "1.45-1.5",
      "1.5-1.55",
      "1.55-1.7",
      "1.7-1.8",
      ">1.8",
    ],
  },
  drainage: {
    label: "Soil Drainage",
    options: [
      "Excessively drained",
      "Somewhat excessively drained",
      "Well drained",
      "Moderately well drained",
      "Imperfectly drained",
      "Poorly drained",
      "Very poorly drained",
    ],
  },
  AWC: {
    label: "Available Water Capacity (mm/m)",
    options: ["150", "125", "100", "75", "50", "15"],
  },
};

const topographyOptions = {
  elevation: {
    label: "Elevation (m)",
    options: [
      "0-100",
      "100-200",
      "200-500",
      "500-800",
      "800-1200",
      "1200-1500",
      "1500-2200",
      "2200-3500",
      "3500-4500",
      ">4500",
    ],
  },
  slope: {
    label: "Slope (degrees)",
    options: ["0-5", "5-10", "10-15", "15-20", "20-25", "25-30", "30-44"],
  },
  aspect: {
    label: "Aspect (Direction Facing)",
    options: [
      "North",
      "North-East",
      "East",
      "South-East",
      "South",
      "South-West",
      "West",
      "North-West",
    ],
  },
};

const ecologyOptions = {
  NDVI: {
    label: "NDVI based on current land-use",
    options: ["0.7-1", "0.5-0.7", "0.2-0.5", "0-0.2", "<0"],
  },
  LULC: {
    label: "Current Land-use",
    options: [
      "Forest",
      "Grassland",
      "Flooded vegetation",
      "Cropland",
      "Shrub and scrub",
      "Bare ground",
      "Snow and ice",
    ],
  },
};

const socioeconomicOptions = {
  distToDrainage: {
    label: "Distance to Drainage Lines (m)",
    options: [
      "0-5",
      "5-50",
      "50-100",
      "100-250",
      "250-500",
      "500-1000",
      ">1000",
    ],
  },
  distToSettlements: {
    label: "Distance to Settlements (m)",
    options: ["0-20", "20-100", "100-200", "200-500", "500-1000", ">1000"],
  },
  distToRoad: {
    label: "Distance to Roads (m)",
    options: ["0-20", "20-100", "100-200", "200-500", "500-1000", ">1000"],
  },
};

const PlantationAssessmentForm = ({ project, currentUser, closeModal }) => {
  console.log(project.id, currentUser);
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({});
  const [profileData, setProfileData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.REACT_APP_BASEURL}api/v1/projects/${project.id}/plantation/profile/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        console.log("Profile Data:", data);
        setProfileData(data);
        setFormData({
          AWC: data[0].config_user_input.AWC,
          Climate: data[0].config_user_input.Climate,
          Ecology: data[0].config_user_input.Ecology,
          LULC: data[0].config_user_input.LULC,
          NDVI: data[0].config_user_input.NDVI,
          Socioeconomic: data[0].config_user_input.Socioeconomic,
          Soil: data[0].config_user_input.Soil,
          Topography: data[0].config_user_input.Topography,
          annualPrecipitation: data[0].config_user_input.annualPrecipitation,
          aridityIndex: data[0].config_user_input.aridityIndex,
          aspect: data[0].config_user_input.aspect || "",
          distToDrainage: data[0].config_user_input.distToDrainage,
          distToRoad: data[0].config_user_input.distToRoad,
          distToSettlements: data[0].config_user_input.distToSettlements,
          drainage: data[0].config_user_input.drainage,
          elevation: data[0].config_user_input.elevation,
          meanAnnualTemperature:
            data[0].config_user_input.meanAnnualTemperature,
          referenceEvapoTranspiration:
            data[0].config_user_input.referenceEvapoTranspiration,
          slope: data[0].config_user_input.slope,
          subsoilBD: data[0].config_user_input.subsoilBD,
          subsoilCEC: data[0].config_user_input.subsoilCEC,
          subsoilOC: data[0].config_user_input.subsoilOC,
          subsoilPH: data[0].config_user_input.subsoilPH,
          subsoilTexture: data[0].config_user_input.subsoilTexture,
          topsoilBD: data[0].config_user_input.topsoilBD,
          topsoilCEC: data[0].config_user_input.topsoilCEC,
          topsoilOC: data[0].config_user_input.topsoilOC,
          topsoilPH: data[0].config_user_input.topsoilPH,
          topsoilTexture: data[0].config_user_input.topsoilTexture,
        });
        console.log(setFormData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [project.id]);

  // Debugging: Log formData when it updates
  useEffect(() => {
    console.log("Updated FormData:", formData);
  }, [formData]);

  // Checkbox handler
  const handleCheckboxChange = (key, range) => {
    const values = formData[key]?.split(", ").filter(Boolean) || [];
    const updatedValues = values.includes(range)
      ? values.filter((val) => val !== range)
      : [...values, range];

    setFormData((prev) => ({
      ...prev,
      [key]: updatedValues.join(", "),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData, null, 2);

    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/projects/${project.id}/plantation/profile/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "420",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData), // Sending formData as the request body
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("API response data:", data);
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-5xl mx-auto p-6 border rounded-lg shadow-lg bg-white mt-4"
    >
      <h2 className="text-2xl font-bold text-center mb-4">
        Plantation Site Suitability Assessment
      </h2>
      {page === 1 && (
        <>
          <h3 className="text-xl font-semibold mb-2">Climate</h3>
          <div className="mb-4 p-4 bg-gray-100 border-l-4 border-blue-500">
            <p className="text-sm text-gray-700">
              <strong>Climate Parameters:</strong> <br />
              - Annual precipitation (mm) <br />
              - Mean annual temperature (°C) <br />
              - Global aridity index <br />
              - Reference evapotranspiration (mm/day) <br />
              <br />
              For each parameter, please select the range of values which is
              ideal for the crop/tree to be planted. Choose as many options as
              appropriate. You can adjust the weightage of the Climate layer at
              the end of this section.
            </p>
          </div>
          <hr className="mb-4" />

          {Object.entries(climateOptions).map(([key, { label, options }]) => (
            <div key={key} className="pl-8 mt-8">
              <h4 className="text-lg font-semibold mb-2">{label}</h4>
              {options.map((range) => (
                <div key={range} className="mb-2">
                  <input
                    type="checkbox"
                    checked={formData[key]?.split(", ").includes(range)}
                    onChange={() => handleCheckboxChange(key, range)}
                    className="mr-2"
                  />
                  <label>{range}</label>
                </div>
              ))}
            </div>
          ))}

          {/* Climate Weightage */}
          <div className="pl-8 mt-8">
            <h4 className="text-lg font-semibold mb-2">
              Climate Weightage (default 35%)
            </h4>
            <input
              type="text"
              value={formData.Climate}
              onChange={(e) =>
                setFormData({ ...formData, Climate: e.target.value })
              }
              className="w-full p-2 border rounded-lg border-gray-300"
            />
          </div>
        </>
      )}

      {page === 2 && (
        <>
          <h3 className="text-xl font-semibold mt-10 mb-2">Soil Parameters</h3>
          <div className="mb-4 p-4 bg-gray-100 border-l-4 border-blue-500">
            <p className="text-sm text-gray-700">
              <strong>The soil parameters are:</strong> <br />
              - Topsoil pH, OC, CEC, bulk density
              <br />
              - Subsoil pH, OC, CEC, bulk density <br />
              - Drainage <br />
              - Available Water Capacity <br />
              <br />
              For each parameter, please select the range of values which is
              ideal for the crop/tree to be planted. Choose as many options as
              appropriate. You can adjust the weightage of the Soil layer at the
              end of this section.
            </p>
          </div>
          <hr className="mb-4" />
          {Object.entries(soilOptions).map(([key, { label, options }]) => (
            <div key={key} className="pl-8 mt-8">
              <h4 className="text-lg font-semibold mb-2">{label}</h4>
              {options.map((range) => (
                <div key={range} className="mb-2">
                  <input
                    type="checkbox"
                    checked={formData[key]?.split(", ").includes(range)}
                    onChange={() => handleCheckboxChange(key, range)}
                    className="mr-2"
                  />
                  <label>{range}</label>
                </div>
              ))}
            </div>
          ))}

          <div className="pl-8 mt-8">
            <h4 className="text-lg font-semibold mb-2">
              Soil Weightage (default 20%)
            </h4>
            <input
              type="text"
              value={formData.Soil}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  soil: { ...formData.Soil, Soil: e.target.value },
                })
              }
              className="w-full p-2 border rounded-lg border-gray-300"
            />
          </div>
        </>
      )}

      {page === 3 && (
        <>
          <h3 className="text-xl font-semibold mt-10 mb-2">Topography</h3>
          <div className="mb-4 p-4 bg-gray-100 border-l-4 border-blue-500">
            <p className="text-sm text-gray-700">
              <strong>The topography parameters are:</strong> <br />
              - Elevation (m)
              <br />
              - Slope (degrees) <br />
              - Aspect (direction) <br />
              <br />
              For each parameter, please select the range of values which is
              ideal for the crop/tree to be planted. Choose as many options as
              appropriate. You can adjust the weightage of the Topography layer
              at the end of this section.
            </p>
          </div>
          <hr className="mb-4" />

          {Object.entries(topographyOptions).map(
            ([key, { label, options }]) => (
              <div key={key} className="pl-8 mt-8">
                <h4 className="text-lg font-semibold mb-2">{label}</h4>
                {options.map((range) => (
                  <div key={range} className="mb-2">
                    <input
                      type="checkbox"
                      checked={formData[key]?.split(", ").includes(range)}
                      onChange={() => handleCheckboxChange(key, range)}
                      className="mr-2"
                    />
                    <label>{range}</label>
                  </div>
                ))}
              </div>
            )
          )}

          <div className="pl-8 mt-8">
            <h4 className="text-lg font-semibold mb-2">
              Topography Weightage (default 25%)
            </h4>
            <input
              type="text"
              value={formData.Topography}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  Topography: e.target.value,
                })
              }
              className="w-full p-2 border rounded-lg border-gray-300"
            />
          </div>
        </>
      )}

      {page === 4 && (
        <>
          <h3 className="text-xl font-semibold mb-2">Ecology Parameters</h3>
          <hr className="mb-4" />
          <div className="mb-4 p-4 bg-gray-100 border-l-4 border-blue-500">
            {" "}
            <p className="text-sm text-gray-700">
              <strong>The ecology parameters are:</strong> <br />
              - NDVI <br />
              - Forest Cover (based on LULC classes) <br />
              <br />
              For each parameter, please select the range of values which is
              ideal for the crop/tree to be planted. Choose as many options as
              appropriate. You can adjust the weightage of the Ecology layer at
              the end of this section.{" "}
            </p>{" "}
          </div>

          {Object.entries(ecologyOptions).map(([key, { label, options }]) => (
            <div key={key} className="pl-8 mt-8">
              <h4 className="text-lg font-semibold mb-2">{label}</h4>
              {options.map((range) => (
                <div key={range} className="mb-2">
                  <input
                    type="checkbox"
                    checked={formData[key]?.split(", ").includes(range)}
                    onChange={() => handleCheckboxChange(key, range)}
                    className="mr-2"
                  />
                  <label>{range}</label>
                </div>
              ))}
            </div>
          ))}

          <div className="pl-8 mt-8">
            <h4 className="text-lg font-semibold mb-2">
              Ecology Weightage (default 10%)
            </h4>
            <input
              type="text"
              value={formData.Ecology}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  Ecology: e.target.value,
                })
              }
              className="w-full p-2 border rounded-lg border-gray-300"
            />
          </div>
        </>
      )}

      {page === 5 && (
        <>
          <h3 className="text-xl font-semibold mb-2">
            Socioeconomic Parameters
          </h3>
          <div className="mb-4 p-4 bg-gray-100 border-l-4 border-blue-500">
            <p className="text-sm text-gray-700">
              <strong>The socioeconomic parameters are:</strong> <br />
              - Distance of plantation site to drainage lines (m)
              <br />
              - Distance of plantation site to settlements (m) <br />
              -Distance of plantation site to a road (m) <br />
              <br />
              For each parameter, please select the range of values which is
              ideal for the planned plantation. Choose as many options as
              appropriate. You can adjust the weightage of the Socioeconomic
              layer at the end of this section.
            </p>
          </div>
          <hr className="mb-4" />

          {Object.entries(socioeconomicOptions).map(
            ([key, { label, options }]) => (
              <div key={key} className="pl-8 mt-8">
                <h4 className="text-lg font-semibold mb-2">{label}</h4>
                {options.map((range) => (
                  <div key={range} className="mb-2">
                    <input
                      type="checkbox"
                      checked={formData[key]?.split(", ").includes(range)}
                      onChange={() => handleCheckboxChange(key, range)}
                      className="mr-2"
                    />
                    <label>{range}</label>
                  </div>
                ))}
              </div>
            )
          )}

          <div className="pl-8 mt-8">
            <h4 className="text-lg font-semibold mb-2">
              Socioeconomic Weightage (default 10%)
            </h4>
            <input
              type="text"
              value={formData.Socioeconomic}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  Socioeconomic: e.target.value,
                })
              }
              className="w-full p-2 border rounded-lg border-gray-300"
            />
          </div>
        </>
      )}
      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        {page > 1 && (
          <button
            type="button"
            onClick={() => setPage(page - 1)}
            className="px-6 py-2 bg-gray-400 text-white font-semibold rounded-lg shadow"
          >
            Previous
          </button>
        )}

        {page < 5 && (
          <button
            type="button"
            onClick={() => setPage(page + 1)}
            className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow"
          >
            Next
          </button>
        )}

        {page === 5 && (
          <button
            type="submit"
            className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg shadow"
          >
            Submit
          </button>
        )}
      </div>
    </form>
  );
};

export default PlantationAssessmentForm;
