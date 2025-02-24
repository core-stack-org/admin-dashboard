import React, { useState, useEffect } from "react";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import Select from "react-select";
import config from "../services&apis/config.js";

const SetupUser = () => {
  const [page, setPage] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    role: "",
    experience: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [blocksList, setBlocksList] = useState([]);
  const [state, setState] = useState({ id: "", name: "" });
  const [district, setDistrict] = useState({ id: "", name: "" });
  const [block, setBlock] = useState({ id: "", name: "" });
  const api_url = config.api_url;

  const passwordRequirements = [
    "At least 8 characters long",
    "At least 1 number",
    "At least 1 lowercase letter",
    "At least 1 uppercase letter",
    "At least 1 special character (^ $ * . [ ] { } ( ) ? - \" ! @ # % & / \\ , < > ' : ; | _ ~ ` + =)",
  ];

  const [errors, setErrors] = useState({});
  const [organisationOptions, setOrganisationOptions] = useState([
    { value: "google", label: "Google" },
    { value: "microsoft", label: "Microsoft" },
    { value: "apple", label: "Apple" },
  ]);
  const [planPermission, setPlanPermission] = useState([
    { value: "viewer", label: "Plan Viewer" },
    { value: "editor", label: "Plan Editor" },
    { value: "admin", label: "Plan Admin" },
  ]);
  const [newOrganisation, setNewOrganisation] = useState("");
  const [showAddOrganisation, setShowAddOrganisation] = useState(false);

  const [selectedOption, setSelectedOption] = useState(null);

  const handleAddOrganisation = () => {
    if (newOrganisation.trim() === "") return;
    const newOption = {
      value: newOrganisation.toLowerCase(),
      label: newOrganisation,
    };
    setOrganisationOptions((prevOptions) => [...prevOptions, newOption]);
    setNewOrganisation("");
    setShowAddOrganisation(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await fetch(`${api_url}/api/v1/get_states/`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
          "ngrok-skip-browser-warning": "420",
        },
      });
      const data = await response.json();
      const sortedStates = data.states.sort((a, b) =>
        a.state_name.localeCompare(b.state_name)
      );
      console.log(sortedStates);
      setStatesList(sortedStates);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const fetchDistricts = async (selectedState) => {
    try {
      const response = await fetch(
        `${api_url}/api/v1/get_districts/${selectedState}/`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "ngrok-skip-browser-warning": "420",
          },
        }
      );
      const data = await response.json();
      const sortedDistricts = data.districts.sort((a, b) =>
        a.district_name.localeCompare(b.district_name)
      );
      console.log(sortedDistricts);
      setDistrictsList(sortedDistricts);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const fetchBlocks = async (selectedDistrict) => {
    try {
      const response = await fetch(
        `${api_url}/api/v1/get_blocks/${selectedDistrict}/`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "ngrok-skip-browser-warning": "420",
          },
        }
      );
      const data = await response.json();
      const sortedBlocks = data.blocks.sort((a, b) =>
        a.block_name.localeCompare(b.block_name)
      );
      console.log(sortedBlocks);
      setBlocksList(sortedBlocks);
    } catch (error) {
      console.error("Error fetching blocks:", error);
    }
  };

  const handleStateChange = (selectedOption) => {
    console.log(selectedOption);
    if (!selectedOption) {
      setState({ id: "", name: "" });
      setDistrictsList([]);
      setBlocksList([]);
      return;
    }
    const [state_id, state_name] = selectedOption.value.split("_");
    console.log("Parsed state_id:", state_id, "Parsed state_name:", state_name);

    setState({ id: state_id, name: state_name });
    setDistrictsList([]);
    setBlocksList([]);

    fetchDistricts(state_id);
  };

  const handleDistrictChange = (selectedOption) => {
    console.log(selectedOption);
    if (!selectedOption) {
      setDistrict({ id: "", name: "" });
      setBlocksList([]);
      return;
    }
    const [district_id, district_name] = selectedOption.value.split("_");
    setDistrict({ id: district_id, name: district_name });

    setBlocksList([]);
    fetchBlocks(district_id);
  };

  const handleBlockChange = (selectedOption) => {
    if (!selectedOption) {
      setBlock({ id: "", name: "" });
      return;
    }

    const [id, block_name] = selectedOption.value.split("_");
    setBlock({ id: id, name: block_name });
  };

  const validatePage = () => {
    const newErrors = {};
    const validatePassword = (password) => {
      const requirements = [
        {
          regex: /.{8,}/,
          message: "Password must be at least 8 characters long",
        },
        { regex: /\d/, message: "Password must contain at least 1 number" },
        {
          regex: /[a-z]/,
          message: "Password must contain at least 1 lowercase letter",
        },
        {
          regex: /[A-Z]/,
          message: "Password must contain at least 1 uppercase letter",
        },
        {
          regex: /[^\w\s]/,
          message:
            "Password must contain at least 1 special character (^ $ * . [ ] { } ( ) ? - \" ! @ # % & / \\ , < > ' : ; | _ ~ ` + =)",
        },
      ];

      const errors = requirements
        .filter(({ regex }) => !regex.test(password))
        .map(({ message }) => message);

      return {
        isValid: errors.length === 0,
        errors,
      };
    };

    if (page === 0) {
      if (!formData.userName) newErrors.username = "First name is required";
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else {
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
          newErrors.password = passwordValidation.errors.join(", ");
        }
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (page === 1) {
      if (!selectedOption) newErrors.organisation = "Organisation is required";
    }
    if (page === 2) {
      if (!formData.planName) {
        newErrors.planName = "Plan Name is required";
      }
      if (!formData.villageName) {
        newErrors.villageName = "Village Name is required";
      }
      if (!formData.panchayatName) {
        newErrors.panchayatName = "Panchayat Name is required";
      }
      if (!formData.organisationName) {
        newErrors.organisationName = "Organisation Name is required";
      }
      if (!state.id || !state.name) {
        newErrors.state = "Please select a valid state";
      }
      if (!district.id || !district.name) {
        newErrors.district = "Please select a valid district";
      }
      if (!block.id || !block.name) {
        newErrors.block = "Please select a valid block";
      }
    }

    if (page === 3) {
      if (!formData.planPermission) {
        newErrors.planPermission = "Plan Permission is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validatePage()) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setPage((prev) => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validatePage()) {
      console.log("Form submitted:", formData);
      // Handle form submission here
    }
  };

  const pages = [
    {
      title: "User Information",
      content: (
        <div className="space-y-8">
          <div>
            <label
              htmlFor="userName"
              className="block text-sm font-medium mb-1"
            >
              User Name
            </label>
            <input
              id="userName"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              autoComplete="off"
              className={`w-full p-2 border rounded-lg ${
                errors.userName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.userName}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setShowPasswordRules(true)}
                onBlur={() => setShowPasswordRules(false)}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className={`w-full p-2 border rounded-lg ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          {showPasswordRules && (
            <div className="mt-2 p-2 bg-gray-100 border rounded-lg text-sm text-gray-700">
              <p className="font-medium">Password must include:</p>
              <ul className="list-disc ml-5">
                {passwordRequirements.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Confirm Password */}
          <div className="relative">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                type={showConfirmPassword ? "text" : "password"}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Organisation",
      content: (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="organisation"
              className="block text-sm font-medium mb-8"
            >
              Organisation
            </label>
            <Select
              id="organisation"
              name="organisation"
              value={selectedOption}
              onChange={(selected) => setSelectedOption(selected)}
              options={organisationOptions}
              isSearchable
              placeholder="Select or search for a Organisation"
              classNamePrefix="react-select"
            />
          </div>
          {/* Toggle input field and save button */}
          {showAddOrganisation && (
            <div className="flex gap-2 mt-4">
              <input
                type="text"
                value={newOrganisation}
                onChange={(e) => setNewOrganisation(e.target.value)}
                placeholder="Enter new organisation"
                className="flex-grow p-2 border rounded-lg border-gray-300"
              />
              <button
                onClick={handleAddOrganisation}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          )}
          {/* Add button */}
          {!showAddOrganisation && (
            <button
              type="button"
              onClick={() => setShowAddOrganisation(true)}
              className="mt-4 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            >
              + Add Organisation
            </button>
          )}
        </div>
      ),
    },
    {
      title: "Plan",
      content: (
        <div className="space-y-4">
          {/* State Dropdown */}
          <div>
            <label htmlFor="state" className="block text-sm font-medium mb-1">
              State
            </label>
            <Select
              id="state"
              name="state"
              options={statesList.map((state) => ({
                value: `${state.state_census_code}_${state.state_name}`,
                label: state.state_name,
              }))}
              value={
                state.id && state.name
                  ? { value: `${state.id}_${state.name}`, label: state.name }
                  : ""
              }
              onChange={handleStateChange}
              classNamePrefix="react-select"
            />
          </div>

          {/* District Dropdown */}
          <div>
            <label
              htmlFor="district"
              className="block text-sm font-medium mb-1"
            >
              District
            </label>
            <Select
              id="district"
              name="district"
              options={districtsList.map((district) => ({
                value: `${district.id}_${district.district_name}`,
                label: district.district_name,
              }))}
              onChange={handleDistrictChange} // Update the district when selected
              value={
                district.id && district.name
                  ? {
                      value: `${district.id}_${district.name}`,
                      label: district.name,
                    } // Ensure that district.id and district.name are correctly set
                  : ""
              }
              classNamePrefix="react-select"
            />
          </div>

          {/* Block Dropdown */}
          <div>
            <label htmlFor="block" className="block text-sm font-medium mb-1">
              Block
            </label>
            <Select
              id="block"
              name="block"
              options={blocksList.map((block) => ({
                value: `${block.id}_${block.block_name}`,
                label: block.block_name,
              }))}
              onChange={handleBlockChange}
              value={
                block.id && block.name
                  ? { value: `${block.id}_${block.name}`, label: block.name }
                  : ""
              }
              classNamePrefix="react-select"
            />
          </div>

          {/* Plan Name Text Box */}
          <div>
            <label
              htmlFor="planName"
              className="block text-sm font-medium mb-1"
            >
              Plan Name
            </label>
            <input
              id="planName"
              name="planName"
              value={formData.planName}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${
                errors.planName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.planName && (
              <p className="text-red-500 text-sm mt-1">{errors.planName}</p>
            )}
          </div>

          {/* Organisation Name Text Box */}
          <div>
            <label
              htmlFor="organisationName"
              className="block text-sm font-medium mb-1"
            >
              Organisation Name
            </label>
            <input
              id="organisationName"
              name="organisationName"
              value={formData.organisationName}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${
                errors.organisationName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.organisationName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.organisationName}
              </p>
            )}
          </div>

          {/* Village Name Text Box */}
          <div>
            <label
              htmlFor="villageName"
              className="block text-sm font-medium mb-1"
            >
              Village Name
            </label>
            <input
              id="villageName"
              name="villageName"
              value={formData.villageName}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${
                errors.villageName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.villageName && (
              <p className="text-red-500 text-sm mt-1">{errors.villageName}</p>
            )}
          </div>

          {/* Panchayat Name Text Box */}
          <div>
            <label
              htmlFor="panchayatName"
              className="block text-sm font-medium mb-1"
            >
              Panchayat Name
            </label>
            <input
              id="panchayatName"
              name="panchayatName"
              value={formData.panchayatName}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${
                errors.panchayatName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.panchayatName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.panchayatName}
              </p>
            )}
          </div>
        </div>
      ),
    },

    {
      title: "Plan Permission",
      content: (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="planPermission"
              className="block text-sm font-medium mb-8"
            >
              Plan Permissions
            </label>
            <Select
              id="planPermission"
              name="planPermission"
              value={selectedOption}
              onChange={(selected) => setSelectedOption(selected)}
              options={planPermission}
              isSearchable
              placeholder="Select or search for a permission"
              classNamePrefix="react-select"
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-md mt-32">
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-6">{pages[page].title}</h2>
        <div className="flex justify-center gap-20 mb-8">
          {pages.map((_, index) => (
            <div
              key={index}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                border-2 relative
                ${
                  index === page
                    ? "border-blue-500 bg-blue-500 text-white"
                    : index < page
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-gray-300 text-gray-500"
                }
              `}
            >
              {index + 1}
              {index < pages.length - 1 && (
                <div
                  className={`absolute w-20 h-0.5 right-[-5rem] top-1/2 transform -translate-y-1/2 
                  ${index < page ? "bg-green-500" : "bg-gray-300"}`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {pages[page].content}
        </form>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={page === 0}
            className={`px-4 py-2 rounded-lg border border-gray-300 
              ${
                page === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
          >
            Previous
          </button>

          {page === pages.length - 1 ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 flex items-center"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Submit
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupUser;
