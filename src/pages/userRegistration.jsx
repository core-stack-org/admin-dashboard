import React, { useEffect, useState } from "react";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import logo from "../assets/newLogo.png";

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedPermission, setSelectedPermission] = useState(null);

  const [showPasswordRules, setShowPasswordRules] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    contact_number: "",
    organization: "",
    account_type: "",
    gender: "",
    age: "",
    education: ""
  });
  const passwordRequirements = [
    "At least 8 characters long",
    "At least 1 number",
    "At least 1 lowercase letter",
    "At least 1 uppercase letter",
    "At least 1 special character (^ $ * . [ ] { } ( ) ? - \" ! @ # % & / \\ , < > ' : ; | _ ~ ` + =)",
  ];

  const [errors, setErrors] = useState({});

  const loadOrganization = async () => {

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/auth/register/available_organizations`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "420",
          },
        }
      );
      const data = await response.json();
      // return data.map((org) => ({
      //   value: org.id,
      //   label: org.name,
      // }));
      return [
        ...data.map((org) => ({
          value: org.id,
          label: org.name,
        })),
        {
          value: "other_org",
          label: "Other (Not Listed)"
        }, // static option
      ];
    } catch (error) {
      console.error("Error fetching organizations:", error);
      return [];
    }
  };

  const handleChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;

    // numeric-only username ko 10 digits tak limit karo
    if (name === "username" && /^\d+$/.test(value)) {
      value = value.slice(0, 10);
    }

    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value ? "" : prevErrors[name],
    }));
  };

  const handleUsernameBlur = () => {
    const { username, contact_number, email } = formData;

    if (/^\d{10}$/.test(username) && !contact_number) {
      setFormData((prev) => ({ ...prev, contact_number: username }));
    }

    if (
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(username) &&
      !email
    ) {
      setFormData((prev) => ({ ...prev, email: username }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name) newErrors.first_name = "First name is required";
    if (!formData.last_name) newErrors.last_name = "Last name is required";
    if (!formData.username) newErrors.username = "User name is required";
    if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
      ) {
        newErrors.email = "Invalid email format";
      }
    // Remove contact number as mandatory
    if (formData.contact_number) {
      if (!/^\d{10}$/.test(formData.contact_number)) {
        newErrors.contact_number = "Enter a valid 10-digit contact number";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = "Passwords do not match";
    }

    if (formData.account_type === "org" && !formData.organization) {
      newErrors.organization = "Organization is required";
    }
    if (!formData.gender) newErrors.gender = "Gender is required";

    if (!formData.age) {
      newErrors.age = "Age is required";
    } else if (!/^\d+$/.test(formData.age)) {
      newErrors.age = "Only numbers are allowed";
    } else if (Number(formData.age) <= 0) {
      newErrors.age = "Enter a valid age";
    }

    if (!formData.education) {
      newErrors.education = "Education is required";
    }


    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      const registrationData = new FormData();

      registrationData.append("username", formData.username);
      registrationData.append("email", formData.email);
      registrationData.append("password", formData.password);
      registrationData.append("password_confirm", formData.password_confirm);
      registrationData.append("first_name", formData.first_name);
      registrationData.append("last_name", formData.last_name);
      registrationData.append("contact_number", formData.contact_number);
      registrationData.append("account_type", formData.account_type);
      registrationData.append("gender", formData.gender);
      registrationData.append("age", formData.age);
      registrationData.append("education_qualification", formData.education);

      // optional
      if (formData.organization) {
        registrationData.append("organization", formData.organization);
      }

      try {
        const token = sessionStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.REACT_APP_BASEURL}/api/v1/auth/register/`,
          {
            method: "POST",
            headers: {
              "ngrok-skip-browser-warning": "420",
              // Authorization: `Bearer ${token}`,
            },
            body: registrationData,
          }
        );

        if (response.ok) {
          toast.success("User registered successfully!");
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
          setFormData({
            username: "",
            email: "",
            password: "",
            password_confirm: "",
            first_name: "",
            last_name: "",
            contact_number: "",
            organization: "",
            account_type: "",
            gender: "",
            age: "",
            education: "",
          });
          setSelectedOption(null);
          setSelectedPermission([]);
          setErrors({});
        } else {
          const errorData = await response.json(); // Parse the JSON response
          const errorMessages = Object.values(errorData).flat().join(", ");
          toast.error(
            errorMessages || "Registration failed. Please try again."
          );
        }
      } catch (error) {
        console.error("Error during registration:", error);
        toast.error("An error occurred. Please try again later.");
      }
    }
  };
  const handleloginRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={3000} />

<div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-3xl shadow-2xl">
          <div className="md:w-1/4 bg-slate-800 text-white p-6 flex flex-col justify-between gap-10 rounded-t-3xl md:rounded-tr-none md:rounded-l-3xl">
          <img
            src={logo}
            alt="NRM Logo"
            className="h-14 w-14 rounded-xl bg-white p-1 object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold leading-tight mb-2">
              Create your account
            </h1>
            <p className="text-sm text-slate-300">
              Register to explore and manage your landscape on the dashboard.
            </p>
          </div>
          <p className="text-sm text-slate-300">
            Already have an account?{" "}
            <span
              onClick={handleloginRedirect}
              className="text-white font-bold cursor-pointer hover:underline"
            >
              Login here
            </span>
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex-1 p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-7">
            User Registration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* First name */}
            <div>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-600">
                  First name <b className="text-red-600">*</b>
                </span>
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full h-10 border-0 border-b-2 border-gray-300 bg-transparent px-0.5 text-[15px] text-gray-900 placeholder-gray-500 rounded-none focus:outline-none focus:ring-0 focus:border-blue-600"
                  placeholder="Enter first name"
                />
              </label>
              {errors.first_name && (
                <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
              )}
            </div>

            {/* Last name */}
            <div>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-600">
                  Last name <b className="text-red-600">*</b>
                </span>
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full h-10 border-0 border-b-2 border-gray-300 bg-transparent px-0.5 text-[15px] text-gray-900 placeholder-gray-500 rounded-none focus:outline-none focus:ring-0 focus:border-blue-600"
                  placeholder="Enter last name"
                />
              </label>
              {errors.last_name && (
                <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
              )}
            </div>

            {/* Username */}
            <div className="md:col-span-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-600">
                  Username <b className="text-red-600">*</b>
                </span>
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleUsernameBlur}
                  className="w-full h-10 border-0 border-b-2 border-gray-300 bg-transparent px-0.5 text-[15px] text-gray-900 placeholder-gray-500 rounded-none focus:outline-none focus:ring-0 focus:border-blue-600"
                  placeholder="Email, phone number or any username"
                />
              </label>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="flex flex-col gap-1">
               <span className="text-xs font-semibold text-gray-600">
                  Email <span className="text-red-500">*</span>
                </span>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="off"
                  className="w-full h-10 border-0 border-b-2 border-gray-300 bg-transparent px-0.5 text-[15px] text-gray-900 placeholder-gray-500 rounded-none focus:outline-none focus:ring-0 focus:border-blue-600"
                  placeholder="name@example.com"
                />
              </label>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Contact number */}
            <div>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-600">
                  Contact number
                </span>
                <input
                  name="contact_number"
                  value={formData.contact_number || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only numbers (remove non-numeric characters)
                    if (/^\d{0,10}$/.test(value)) {
                      setFormData({ ...formData, contact_number: value });
                    }
                  }}
                  className="w-full h-10 border-0 border-b-2 border-gray-300 bg-transparent px-0.5 text-[15px] text-gray-900 placeholder-gray-500 rounded-none focus:outline-none focus:ring-0 focus:border-blue-600"
                  placeholder="10-digit number"
                />
              </label>
              {formData.contact_number?.length > 0 &&
                formData.contact_number.length !== 10 && (
                  <p className="text-red-500 text-sm mt-1">
                    Incorrect number. Must be 10 digits.
                  </p>
                )}
            </div>

            {/* Gender */}
            <div>
              <span className="block text-xs font-semibold text-gray-600 mb-1">
                Gender <b className="text-red-600">*</b>
              </span>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {[
                  { v: "M", l: "Male" },
                  { v: "F", l: "Female" },
                  { v: "O", l: "Other" },
                ].map((g) => (
                  <label key={g.v} className="flex-1 relative">
                    <input
                      type="radio"
                      name="gender"
                      value={g.v}
                      checked={formData.gender === g.v}
                      onChange={handleChange}
                      className="peer sr-only"
                    />
                    <div className="h-9 flex items-center justify-center rounded-md text-sm font-medium text-gray-600 cursor-pointer peer-checked:bg-white peer-checked:text-blue-600 peer-checked:font-bold peer-checked:shadow peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500">
                      {g.l}
                    </div>
                  </label>
                ))}
              </div>
              {errors.gender && (
                <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
              )}
            </div>

            {/* Account type */}
            <div>
              <span className="block text-xs font-semibold text-gray-600 mb-1">
                Account type <b className="text-red-600">*</b>
              </span>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {[
                  { v: "individual", l: "Individual" },
                  { v: "org", l: "Organization" },
                ].map((t) => (
                  <label key={t.v} className="flex-1 relative">
                    <input
                      type="radio"
                      name="account_type"
                      value={t.v}
                      checked={formData.account_type === t.v}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({
                          ...formData,
                          account_type: value,
                          organization:
                            value === "individual" ? "" : formData.organization,
                        });
                        if (value === "individual") {
                          setSelectedOption(null);
                        }
                      }}
                      className="peer sr-only"
                    />
                    <div className="h-9 flex items-center justify-center rounded-md text-sm font-medium text-gray-600 cursor-pointer peer-checked:bg-white peer-checked:text-blue-600 peer-checked:font-bold peer-checked:shadow peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500">
                      {t.l}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-600">
                  Age <b className="text-red-600">*</b>
                </span>
                <input
                  name="age"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.age}
                  onChange={(e) => {
                    const value = e.target.value;

                    setFormData({
                      ...formData,
                      age: value,
                    });

                    // Validation for numbers only
                    if (value && !/^\d+$/.test(value)) {
                      setErrors((prev) => ({
                        ...prev,
                        age: "Only numbers are allowed",
                      }));
                    } else {
                      setErrors((prev) => ({
                        ...prev,
                        age: "",
                      }));
                    }
                  }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full h-10 border-0 border-b-2 border-gray-300 bg-transparent px-0.5 text-[15px] text-gray-900 placeholder-gray-500 rounded-none focus:outline-none focus:ring-0 focus:border-blue-600"
                  placeholder="Your age"
                />
              </label>
              {errors.age && (
                <p className="text-red-500 text-sm mt-1">{errors.age}</p>
              )}
            </div>

            {/* Education */}
            <div>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-600">
                  Education <b className="text-red-600">*</b>
                </span>
                <select
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full h-10 border-0 border-b-2 border-gray-300 bg-transparent px-0.5 text-[15px] text-gray-900 rounded-none focus:outline-none focus:ring-0 focus:border-blue-600"
                >
                  <option value="">Select Education Qualification</option>
                  <option value="No Formal Education">No Formal Education</option>
                  <option value="Primary">Primary (Class 1-5)</option>
                  <option value="Middle">Middle (Class 6-8)</option>
                  <option value="Secondary">Secondary (Class 9-10)</option>
                  <option value="Higher Secondary">Higher Secondary (Class 11-12)</option>
                  <option value="ITI">ITI / Vocational Training</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Post Graduate">Post Graduate</option>
                  <option value="Doctorate">Doctorate / PhD</option>
                </select>
              </label>
              {errors.education && (
                <p className="text-red-500 text-sm mt-1">{errors.education}</p>
              )}
            </div>

            {/* Organization */}
            <div className="md:col-span-2">
              <span className="block text-xs font-semibold text-gray-600 mb-1">
                Organization
              </span>
              <AsyncSelect
                loadOptions={loadOrganization}
                defaultOptions
                isDisabled={formData.account_type === "individual"}
                value={
                  formData.account_type === "individual" ? null : selectedOption
                }
                onChange={(selected) => {
                  setSelectedOption(selected);
                  setFormData({
                    ...formData,
                    organization:
                      selected?.value === "other_org"
                        ? ""
                        : selected?.value || "",
                  });
                }}
                placeholder={
                  <div className="flex items-center gap-1">
                    Select or search for an Organisation
                    {formData.account_type !== "individual" && (
                      <span className="text-red-500">*</span>
                    )}
                  </div>
                }
                classNamePrefix="react-select"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minHeight: "40px",
                    height: "40px",
                    border: 0,
                    borderBottom: "2px solid #D1D5DB",
                    borderRadius: 0,
                    boxShadow: "none",
                    backgroundColor:
                      formData.account_type === "individual"
                        ? "#f3f4f6"
                        : "transparent", // greyed
                    cursor:
                      formData.account_type === "individual"
                        ? "not-allowed"
                        : "default",
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: "#6B7280",
                    fontSize: "15px",
                  }),
                  valueContainer: (provided) => ({
                    ...provided,
                    padding: "0 2px",
                  }),
                  indicatorSeparator: () => ({ display: "none" }),
                }}
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary25: "lightgray",
                    primary: "gray",
                  },
                })}
              />
            </div>

            {selectedOption?.value === "other_org" && (
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Enter Organization Name"
                  value={formData.organization}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      organization: e.target.value,
                    })
                  }
                  className="w-full h-10 border-0 border-b-2 border-gray-300 bg-transparent px-0.5 text-[15px] text-gray-900 placeholder-gray-500 rounded-none focus:outline-none focus:ring-0 focus:border-blue-600"
                />
                <p className="mt-2 text-sm text-amber-600">
                  Note: If your organization is not listed, please enter its
                  name here. Our team will review and add it to the
                  organization directory.
                </p>
              </div>
            )}

            {/* Password */}
            <div className="relative">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-600">
                  Password <b className="text-red-600">*</b>
                </span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="off"
                  onFocus={() => setShowPasswordRules(true)}
                  onBlur={() => setShowPasswordRules(false)}
                  className="w-full h-10 border-0 border-b-2 border-gray-300 bg-transparent pl-0.5 pr-8 text-[15px] text-gray-900 placeholder-gray-500 rounded-none focus:outline-none focus:ring-0 focus:border-blue-600"
                  placeholder="Enter password"
                />
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>

              {showPasswordRules && (
                <div className="absolute top-full left-0 w-full mt-2 p-2 bg-gray-100 border rounded-lg text-sm text-gray-700 shadow-lg z-10">
                  <p className="font-medium">Password must include:</p>
                  <ul className="list-disc ml-5">
                    {passwordRequirements.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-gray-600">
                    Confirm password <b className="text-red-600">*</b>
                  </span>
                  <input
                    name="password_confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.password_confirm}
                    onChange={handleChange}
                    className="w-full h-10 border-0 border-b-2 border-gray-300 bg-transparent pl-0.5 pr-8 text-[15px] text-gray-900 placeholder-gray-500 rounded-none focus:outline-none focus:ring-0 focus:border-blue-600"
                    placeholder="Re-enter password"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 bottom-2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {errors.password_confirm && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password_confirm}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button
              type="submit"
              className="px-10 h-11 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 flex items-center"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
