import React, { useState } from "react";
import plantationForm from "../jsons/plantationForm.json";

const sections = [
  "Registration",
  "Climate",
  "Soil",
  "Topography",
  "Ecology",
  "Socioeconomic",
];

export default function PlantationAssessment({ isEmbedded }) {
  console.log(plantationForm);
  const [activeSection, setActiveSection] = useState(0);
  const [formData, setFormData] = useState({
    registration: { institution: "", email: "", aezZone: "", cropSpecies: "" },
    climate: {
      precipitation: [],
      temperature: [],
      aridityIndex: [],
      evapotranspiration: [],
      climateWeightage: "35%",
    },
    soil: {
      topsoilPh: [],
      subsoilPh: [],
      topsoilOrganicCarbon: [],
      subsoilOrganicCarbon: [],
      topsoilCationExchange: [],
      subsoilCationExchange: [],
      topsoilTexture: "",
      subsoilTexture: "",
      topsoilBulkDensity: "",
      subsoilBulkDensity: "",
      soilDrainage: "",
      availableWaterCapacity: "",
      soilWeightage: "20%",
    },
    topography: {
      elevation: "",
      slope: "",
      aspect: "",
      topographyWeightage: "25%",
    },
    ecology: {
      ndvi: [],
      landUse: [],
      ecologyWeightage: "10%",
    },
    socioeconomic: {
      drainageDistance: [],
      settlementDistance: [],
      roadDistance: [],
      socioeconomicWeightage: "10%",
      remarks: "",
    },
  });

  const [errors, setErrors] = useState({ institution: false, email: false });

  const handleNext = () => {
    if (activeSection === 0) {
      const newErrors = {
        institution: formData.registration.institution.trim() === "",
        email: formData.registration.email.trim() === "",
      };
      setErrors(newErrors);
      if (newErrors.institution || newErrors.email) return;
    }
    setActiveSection((prev) => Math.min(prev + 1, sections.length - 1));
  };

  const handleBack = () => setActiveSection((prev) => Math.max(prev - 1, 0));

  const handleCheckboxChange = (category, value) => {
    setFormData((prevData) => {
      const updatedValues = prevData.climate[category].includes(value)
        ? prevData.climate[category].filter((item) => item !== value)
        : [...prevData.climate[category], value];
      return {
        ...prevData,
        climate: { ...prevData.climate, [category]: updatedValues },
      };
    });
  };

  return (
    <div
      className={`w-full max-w-5xl mx-auto p-6 border rounded-lg shadow-lg bg-white ${
        isEmbedded ? "mt-0" : "mt-24"
      }`}
    >
      {" "}
      <h2 className="text-2xl font-bold text-center mb-4">
        Plantation Site Suitability Assessment
      </h2>
      <h3 className="text-xl font-semibold mb-2">{sections[activeSection]}</h3>
      <hr className="mb-4" />
      {activeSection === 0 && (
        <>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-4">
              Name of Institution <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.registration.institution}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  registration: {
                    ...formData.registration,
                    institution: e.target.value,
                  },
                })
              }
              className={`w-full p-2 border rounded-lg border-gray-300 ${
                errors.institution ? "border-red-500" : ""
              }`}
              required
            />
            {errors.institution && (
              <p className="text-red-500 text-sm">This field is required.</p>
            )}
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-4 mt-12">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.registration.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  registration: {
                    ...formData.registration,
                    email: e.target.value,
                  },
                })
              }
              className={`w-full p-2 border rounded-lg border-gray-300 ${
                errors.email ? "border-red-500" : ""
              }`}
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm">This field is required.</p>
            )}
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-4 mt-12">
              Which AEZ does the plantation site fall in?
            </label>
            <select
              value={formData.registration.aezZone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  registration: {
                    ...formData.registration,
                    aezZone: e.target.value,
                  },
                })
              }
              className="w-full p-2 border rounded-lg border-gray-300"
            >
              <option value="">Select</option>
              <option value="zone1">
                Western Himalayas, cold arid eco-region (A13E1)
              </option>
              <option value="zone2">
                Western Plain, Kachchh and part of Kathiawar Peninsula, hot arid
                eco-region(M9E1)
              </option>
              <option value="zone3">
                Deccan plateau, hot arid ecosubregion (K6E2)
              </option>
              <option value="zone4">
                Northern Plain (and Central Highlands) including Aravallis, hot
                semi-arid ecoregion (N8D2)
              </option>
              <option value="zone5">
                Central (Malwa) Highlands, Gujarat plains and Kathiawar
                Peninsula Ecoregion (I5 D2)
              </option>
              <option value="zone6">
                Deccan Plateau, hot semi-arid eco-region (K4D2)
              </option>
              <option value="zone7">
                Deccan Plateau (Telangana) and Eastern Ghats, hot semiarid
                ecoregion (K6D2)
              </option>
              <option value="zone8">
                Eastern Ghats and Tamil Nadu Uplands and Deccan (Karnataka)
                Plateau, hot semiarid eco-region (H1D2)
              </option>
              <option value="zone9">
                Northern Plain, hot subhumid (dry) eco-region (N8C3)
              </option>
              <option value="zone10">
                Central Highlands (Malwa and Bundelkhand), hot subhumid (dry)
                eco-region (I6C3(4))
              </option>
              <option value="zone11">
                Chattisgarh/Mahanadi Basin Agro-eco-region (J3 C3)"
              </option>
              <option value="zone12">
                Eastern Plateau (Chhotanagpur) and Eastern Ghats, hot subhumid
                eco-region (J23C3(4))
              </option>
              <option value="zone13">
                Eastern Plain, hot subhumid (moist) ecoregion (08C4)"
              </option>
              <option value="zone14">
                Western Himalayas, warm subhumid (to humid with inclusion of
                perhumid) ecoregion [A15C(BA)4(5)]
              </option>
              <option value="zone15">
                Assam and Bengal Plain, hot subhumid to humid (inclusion of
                perhumid) eco-region (Q8C(BA)5)
              </option>
              <option value="zone16">
                Eastern Himalayas, warm perhumid eco-region (C11A5)
              </option>
              <option value="zone17">
                North-eastern Hills (Purvachal), warm perhumid ecoregion (D2A5)
              </option>
              <option value="zone18">
                Eastern Coastal Plain, hot subhumid to semiarid ecoregion
                (S7Cd2-5)
              </option>
              <option value="zone19">
                Western Ghats and Coastal Plain, hot humid-perhumid eco-region
                (E2BA5)
              </option>
              <option value="zone20">
                Islands of Andaman-Nicobar and Lakshadweep, hot humid to
                perhumid island ecoregion (T1A(B)5/T1B(A)5)
              </option>
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-4 mt-12">
              What is the crop/tree species being planted?
            </label>
            <input
              type="text"
              value={formData.registration.cropSpecies}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  registration: {
                    ...formData.registration,
                    cropSpecies: e.target.value,
                  },
                })
              }
              className="w-full p-2 border rounded-lg border-gray-300"
            />
          </div>
        </>
      )}
      {activeSection === 1 && (
        <>
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

          <div className="pl-8">
            <h4 className="text-lg font-semibold mb-2 mt-8">
              1. Annual Precipitation (mm)
            </h4>
            {[
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
            ].map((range) => (
              <div key={range} className="mb-2">
                <input
                  type="checkbox"
                  checked={
                    formData.climate.precipitation?.includes(range) || false
                  }
                  onChange={() => handleCheckboxChange("precipitation", range)}
                  className="mr-2"
                />
                <label>{range}</label>
              </div>
            ))}

            <h4 className="text-lg font-semibold mb-2 mt-8">
              2. Mean Annual Temperature (°C)
            </h4>
            {[
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
            ].map((range) => (
              <div key={range} className="mb-2">
                <input
                  type="checkbox"
                  checked={
                    formData.climate.temperature?.includes(range) || false
                  }
                  onChange={() => handleCheckboxChange("temperature", range)}
                  className="mr-2"
                />
                <label>{range}</label>
              </div>
            ))}

            <h4 className="text-lg font-semibold mb-2 mt-8">
              3. Aridity Index
            </h4>
            {["<0.05", "0.05-0.20", "0.20-0.50", "0.50-0.65", ">0.65"].map(
              (range) => (
                <div key={range} className="mb-2">
                  <input
                    type="checkbox"
                    checked={
                      formData.climate.aridityIndex?.includes(range) || false
                    }
                    onChange={() => handleCheckboxChange("aridityIndex", range)}
                    className="mr-2"
                  />
                  <label>{range}</label>
                </div>
              )
            )}
            <h4 className="text-lg font-semibold mb-2 mt-8">
              4. Reference Evapotranspiration (mm/day)
            </h4>
            {["0-2", "2-4", "4-6", "6-8", "8-10", ">10"].map((range) => (
              <div key={range} className="mb-2">
                <input
                  type="checkbox"
                  checked={
                    formData.climate.evapotranspiration?.includes(range) ||
                    false
                  }
                  onChange={() =>
                    handleCheckboxChange("evapotranspiration", range)
                  }
                  className="mr-2"
                />
                <label>{range}</label>
              </div>
            ))}

            <h4 className="text-lg font-semibold mb-2 mt-8">
              5. Climate Weightage (default 35%)
            </h4>
            <input
              type="text"
              value={formData.climate.climateWeightage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  climate: {
                    ...formData.climate,
                    climateWeightage: e.target.value,
                  },
                })
              }
              className="w-full p-2 border rounded-lg border-gray-300"
            />
          </div>
        </>
      )}
      {activeSection === 2 && (
        <>
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
          <div className="pl-8">
            <h4 className="text-lg font-semibold mb-2 mt-8">1. Topsoil pH</h4>
            {[
              "<4.5",
              "4.5-5.5",
              "5.5-6",
              "6-6.5",
              "6.5-7",
              "7-7.5",
              "7.5-8.5",
              "8.5-9",
              ">9",
            ].map((range) => (
              <div key={range} className="mb-2">
                <input
                  type="checkbox"
                  checked={formData.soil.topsoilPh?.includes(range) || false}
                  onChange={() =>
                    handleCheckboxChange("topsoilPh", range, "soil")
                  }
                  className="mr-2"
                />
                <label>{range}</label>
              </div>
            ))}

            <h4 className="text-lg font-semibold mb-2 mt-8">2. Subsoil pH</h4>
            {[
              "<4.5",
              "4.5-5.5",
              "5.5-6",
              "6-6.5",
              "6.5-7",
              "7-7.5",
              "7.5-8.5",
              "8.5-9",
              ">9",
            ].map((range) => (
              <div key={range} className="mb-2">
                <input
                  type="checkbox"
                  checked={formData.soil.subsoilPh?.includes(range) || false}
                  onChange={() =>
                    handleCheckboxChange("subsoilPh", range, "soil")
                  }
                  className="mr-2"
                />
                <label>{range}</label>
              </div>
            ))}

            <h4 className="text-lg font-semibold mb-2 mt-8">
              3. Topsoil Organic Carbon (%weight)
            </h4>
            {[
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
            ].map((range) => (
              <div key={range} className="mb-2">
                <input
                  type="checkbox"
                  checked={
                    formData.soil.topsoilOrganicCarbon?.includes(range) || false
                  }
                  onChange={() =>
                    handleCheckboxChange("topsoilOrganicCarbon", range, "soil")
                  }
                  className="mr-2"
                />
                <label>{range}</label>
              </div>
            ))}

            <h4 className="text-lg font-semibold mb-2 mt-8">
              4. Subsoil Organic Carbon (%weight)
            </h4>
            {[
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
            ].map((range) => (
              <div key={range} className="mb-2">
                <input
                  type="checkbox"
                  checked={
                    formData.soil.subsoilOrganicCarbon?.includes(range) || false
                  }
                  onChange={() =>
                    handleCheckboxChange("subsoilOrganicCarbon", range, "soil")
                  }
                  className="mr-2"
                />
                <label>{range}</label>
              </div>
            ))}

            <h4 className="text-lg font-semibold mb-2 mt-8">
              5. Topsoil Cation Exchange Capacity (cmol/kg)
            </h4>
            {[
              "0-5",
              "5-10",
              "10-15",
              "15-20",
              "20-25",
              "25-35",
              "35-45",
              ">45",
            ].map((range) => (
              <div key={range} className="mb-2">
                <input
                  type="checkbox"
                  checked={
                    formData.soil.topsoilCationExchange?.includes(range) ||
                    false
                  }
                  onChange={() =>
                    handleCheckboxChange("topsoilCationExchange", range, "soil")
                  }
                  className="mr-2"
                />
                <label>{range}</label>
              </div>
            ))}
            <h4 className="text-lg font-semibold mb-2 mt-8">
              6. Subsoil Cation Exchange Capacity (cmol/kg)
            </h4>
            {[
              "0-5",
              "5-10",
              "10-15",
              "15-20",
              "20-25",
              "25-35",
              "35-45",
              ">45",
            ].map((range) => (
              <div key={range} className="mb-2">
                <input
                  type="checkbox"
                  checked={
                    formData.soil.topsoilCationExchange?.includes(range) ||
                    false
                  }
                  onChange={() =>
                    handleCheckboxChange("topsoilCationExchange", range, "soil")
                  }
                  className="mr-2"
                />
                <label>{range}</label>
              </div>
            ))}
          </div>

          <div className="pl-8">
            <h4 className="text-lg font-semibold mb-2 mt-8">
              6. Topsoil Texture
            </h4>
            <p className="italic">(please select based on the given legend)</p>

            {["Coarse", "Medium", "Fine"].map((texture) => (
              <div key={texture} className="mb-2">
                <input
                  type="radio"
                  name="topsoilTexture"
                  value={texture}
                  checked={formData.soil.topsoilTexture === texture}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      soil: { ...formData.soil, topsoilTexture: texture },
                    })
                  }
                  className="mr-2"
                />
                <label>{texture}</label>
              </div>
            ))}

            <h4 className="text-lg font-semibold mb-2 mt-8">
              7. Subsoil Texture
            </h4>
            {[
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
            ].map((texture) => (
              <div key={texture} className="mb-2">
                <input
                  type="radio"
                  name="subsoilTexture"
                  value={texture}
                  checked={formData.soil.subsoilTexture === texture}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      soil: { ...formData.soil, subsoilTexture: texture },
                    })
                  }
                  className="mr-2"
                />
                <label>{texture}</label>
              </div>
            ))}

            <h4 className="text-lg font-semibold mb-2 mt-8">
              8. Topsoil Bulk Density (kg/dm³)
            </h4>
            {[
              "<1.1",
              "1.1-1.3",
              "1.3-1.35",
              "1.35-1.40",
              "1.40-1.45",
              "1.45-1.5",
              "1.5-1.6",
              "1.6-1.7",
              ">1.7",
            ].map((range) => (
              <div key={range} className="mb-2">
                <input
                  type="radio"
                  name="topsoilBulkDensity"
                  value={range}
                  checked={formData.soil.topsoilBulkDensity === range}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      soil: { ...formData.soil, topsoilBulkDensity: range },
                    })
                  }
                  className="mr-2"
                />
                <label>{range}</label>
              </div>
            ))}

            <h4 className="text-lg font-semibold mb-2 mt-8">
              9. Subsoil Bulk Density (kg/dm³)
            </h4>
            {[
              "<1.3",
              "1.3-1.35",
              "1.35-1.4",
              "1.4-1.45",
              "1.45-1.5",
              "1.5-1.55",
              "1.55-1.7",
              "1.7-1.8",
              ">1.8",
            ].map((range) => (
              <div key={range} className="mb-2">
                <input
                  type="radio"
                  name="subsoilBulkDensity"
                  value={range}
                  checked={formData.soil.subsoilBulkDensity === range}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      soil: { ...formData.soil, subsoilBulkDensity: range },
                    })
                  }
                  className="mr-2"
                />
                <label>{range}</label>
              </div>
            ))}

            <h4 className="text-lg font-semibold mb-2 mt-8">
              10. Soil Drainage
            </h4>
            {[
              "Excessively drained",
              "Somewhat excessively drained",
              "Well drained",
              "Moderately well drained",
              "Imperfectly drained",
              "Poorly drained",
              "Very poorly drained",
            ].map((type) => (
              <div key={type} className="mb-2">
                <input
                  type="radio"
                  name="soilDrainage"
                  value={type}
                  checked={formData.soil.soilDrainage === type}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      soil: { ...formData.soil, soilDrainage: type },
                    })
                  }
                  className="mr-2"
                />
                <label>{type}</label>
              </div>
            ))}
            <h4 className="text-lg font-semibold mb-2 mt-8">
              11. Available Water Capacity (mm/m)
            </h4>
            {[" 150", "125", "100", "75", "50", "15"].map((type) => (
              <div key={type} className="mb-2">
                <input
                  type="radio"
                  name="soilDrainage"
                  value={type}
                  checked={formData.soil.soilDrainage === type}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      soil: { ...formData.soil, soilDrainage: type },
                    })
                  }
                  className="mr-2"
                />
                <label>{type}</label>
              </div>
            ))}
            <h4 className="text-lg font-semibold mb-2 mt-8">
              12. Soil Weightage (default 20%)
            </h4>

            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.soil.soilWeightage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  soil: { ...formData.soil, soilWeightage: e.target.value },
                })
              }
            />
          </div>
        </>
      )}
      {activeSection === 3 && (
        <>
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
          <div className="pl-8">
            <h4 className="text-lg font-semibold mb-2 mt-8">
              1. Elevation (m)
            </h4>
            {[
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
            ].map((range) => (
              <div key={range} className="mb-2">
                <input
                  type="checkbox"
                  checked={
                    formData.topography.elevation?.includes(range) || false
                  }
                  onChange={() => handleCheckboxChange(range)}
                  className="mr-2"
                />
                <label>{range}</label>
              </div>
            ))}

            <h4 className="text-lg font-semibold mb-2 mt-8">
              2. Slope (degrees)
            </h4>
            {["0-5", "5-10", "10-15", "15-20", "20-25", "25-30", "30-44"].map(
              (range) => (
                <div key={range} className="mb-2">
                  <input
                    type="checkbox"
                    checked={
                      formData.topography.slope?.includes(range) || false
                    }
                    onChange={() =>
                      handleCheckboxChange("slope", range, "topography")
                    }
                    className="mr-2"
                  />
                  <label>{range}</label>
                </div>
              )
            )}

            <h4 className="text-lg font-semibold mb-2 mt-8">
              3. Aspect (direction facing)
            </h4>
            {[
              "North",
              "North-East",
              "East",
              "South-East",
              "South",
              "South-West",
              "West",
              "North-West",
            ].map((range) => (
              <div key={range} className="mb-2">
                <input
                  type="checkbox"
                  checked={
                    formData.soil.topsoilOrganicCarbon?.includes(range) || false
                  }
                  onChange={() =>
                    handleCheckboxChange("topsoilOrganicCarbon", range, "soil")
                  }
                  className="mr-2"
                />
                <label>{range}</label>
              </div>
            ))}

            <h4 className="text-lg font-semibold mb-2 mt-8">
              4. Topography Weightage (default 25%):
            </h4>

            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.topography.topographyWeightage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  topography: {
                    ...formData.topography,
                    topographyWeightage: e.target.value,
                  },
                })
              }
            />
          </div>
        </>
      )}
      {activeSection === 4 && (
        <>
          <div className="mb-4 p-4 bg-gray-100 border-l-4 border-blue-500">
            <p className="text-sm text-gray-700">
              <strong>The ecology parameters are:</strong> <br />
              - NDVI
              <br />
              - Forest Cover (based on LULC classes) <br />
              <br />
              For each parameter, please select the range of values which is
              ideal for the crop/tree to be planted. Choose as many options as
              appropriate. You can adjust the weightage of the Ecology layer at
              the end of this section.
            </p>
          </div>
          <div className="pl-8">
            <h4 className="text-lg font-semibold mb-2 mt-8">
              1. NDVI based on current land-use
            </h4>
            {["0.7-1", "0.5-0.7", "0.2-0.5", "0-0.2", "<0"].map((ndvi) => (
              <label key={ndvi} className="block">
                <input
                  type="checkbox"
                  value={ndvi}
                  checked={formData.ecology.ndvi.includes(ndvi)}
                  onChange={() => handleCheckboxChange("ndvi", ndvi, "ecology")}
                />{" "}
                {ndvi}
              </label>
            ))}

            <h4 className="text-lg font-semibold mb-2 mt-8">
              2. Current Land-Use
            </h4>
            {[
              "Forest",
              "Grassland",
              "Flooded vegetation",
              "Cropland",
              "Shrub and scrub",
              "Bare ground",
              "Snow and ice",
            ].map((landUse) => (
              <label key={landUse} className="block">
                <input
                  type="checkbox"
                  value={landUse}
                  checked={formData.ecology.landUse.includes(landUse)}
                  onChange={() =>
                    handleCheckboxChange("landUse", landUse, "ecology")
                  }
                />{" "}
                {landUse}
              </label>
            ))}

            <h4 className="text-lg font-semibold mb-2 mt-8">
              3. Ecology Weightage (default 10%)
            </h4>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.ecology.ecologyWeightage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ecology: {
                    ...formData.ecology,
                    ecologyWeightage: e.target.value,
                  },
                })
              }
            />
          </div>
        </>
      )}
      {activeSection === 5 && (
        <>
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
          <div className="pl-8">
            <h4 className="text-lg font-semibold mb-2 mt-8">
              1. Distance to Drainage Lines (m)
            </h4>
            {[
              "0-5",
              "5-50",
              "50-100",
              "100-250",
              "250-500",
              "500-1000",
              ">1000",
            ].map((ndvi) => (
              <label key={ndvi} className="block">
                <input
                  type="checkbox"
                  value={ndvi}
                  checked={formData.ecology.ndvi.includes(ndvi)}
                  onChange={() => handleCheckboxChange("ndvi", ndvi, "ecology")}
                />{" "}
                {ndvi}
              </label>
            ))}

            <h4 className="text-lg font-semibold mb-2 mt-8">
              2. Distance to Settlements (m)
            </h4>
            {["0-20", "20-100", "100-200", "200-500", "500-1000", ">1000"].map(
              (dist) => (
                <label key={dist} className="block">
                  <input
                    type="checkbox"
                    value={dist}
                    checked={formData.socioeconomic.settlementDistance.includes(
                      dist
                    )}
                    onChange={() =>
                      handleCheckboxChange(
                        "settlementDistance",
                        dist,
                        "socioeconomic"
                      )
                    }
                  />{" "}
                  {dist}
                </label>
              )
            )}
            <h4 className="text-lg font-semibold mb-2 mt-8">
              3. Distance to Roads (m)
            </h4>
            {["0-20", "20-100", "100-200", "200-500", "500-1000", ">1000"].map(
              (dist) => (
                <label key={dist} className="block">
                  <input
                    type="checkbox"
                    value={dist}
                    checked={formData.socioeconomic.roadDistance.includes(dist)}
                    onChange={() =>
                      handleCheckboxChange(
                        "roadDistance",
                        dist,
                        "socioeconomic"
                      )
                    }
                  />{" "}
                  {dist}
                </label>
              )
            )}

            <h4 className="text-lg font-semibold mb-2 mt-8">
              4. Socioeconomic Weightage (default 10%)
            </h4>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.socioeconomic.socioeconomicWeightage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socioeconomic: {
                    ...formData.socioeconomic,
                    socioeconomicWeightage: e.target.value,
                  },
                })
              }
            />
            <h4 className="text-lg font-semibold mb-2 mt-8">
              5. Any remarks or feedback:
            </h4>
            <textarea
              className="w-full p-2 border rounded"
              value={formData.socioeconomic.remarks}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socioeconomic: {
                    ...formData.socioeconomic,
                    remarks: e.target.value,
                  },
                })
              }
            />
          </div>
        </>
      )}
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          disabled={activeSection === 0}
          className="px-4 py-2 border rounded-lg bg-gray-200 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 border rounded-lg bg-blue-500 text-white"
        >
          {activeSection === sections.length - 1 ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
}
