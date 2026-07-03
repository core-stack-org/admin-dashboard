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
    account_type:"",
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
        { value: "other_org",
          label: "Other (Not Listed)" }, // static option
      ];
    } catch (error) {
      console.error("Error fetching organizations:", error);
      return [];
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value ? "" : prevErrors[name],
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name) newErrors.first_name = "First name is required";
    if (!formData.last_name) newErrors.last_name = "Last name is required";
    if (!formData.username) newErrors.username = "User name is required";
    // Remove email validation as mandatory
    if (formData.email) {
      if (
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
      ) {
        newErrors.email = "Invalid email format";
      }
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
    <div className="min-h-screen  flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="p-8 bg-white shadow-lg border border-gray-300 rounded-xl w-full max-w-4xl">
      <div className="relative flex items-center mb-8 h-20">
  {/* Logo - LEFT */}
  <img
    src={logo}
    alt="NRM Logo"
    className="h-16 w-16 absolute left-0"
  />

  {/* Title - CENTER */}
  <h2 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold text-gray-800">
    User Registration
  </h2>
</div>


     
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative w-full">
              <input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 pl-10 pr-3 py-4  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="Enter First Name"
              />
              <span className="absolute right-56 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
                *
              </span>
              {errors.first_name && (
                <p className="text-red-500 text-sm">{errors.first_name}</p>
              )}
            </div>
            <div className="relative w-full">
              <input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 pl-10 pr-3 py-4  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="Enter Last Name"
              />
              <span className="absolute right-56 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
                *
              </span>
              {errors.last_name && (
                <p className="text-red-500 text-sm">{errors.last_name}</p>
              )}
            </div>
          </div>

          <div className="relative w-full">
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 pl-10 pr-3 py-4  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Enter User Name"
            />
            <span className="absolute right-3/4 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
              *
            </span>
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username}</p>
            )}
          </div>

          <div>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 pl-10 pr-3 py-4  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              autoComplete="off"
              placeholder="Enter valid email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          <div>
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
              className="w-full rounded border border-gray-300 pl-10 pr-3 py-4  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Enter 10-digit contact number"
              a
            />
            {formData.contact_number?.length > 0 &&
              formData.contact_number.length !== 10 && (
                <p className="text-red-500 text-sm">
                  Incorrect number. Must be 10 digits.
                </p>
              )}
          </div>

                {/* GENDER (FULL WIDTH LIKE ACCOUNT TYPE) */}
    <div className="w-full rounded border border-gray-300 px-4 py-4 flex items-center gap-20 ">
      <span className="text-gray-400 whitespace-nowrap">
        Gender <span className="text-red-500">*</span>
      </span>

      <label className="flex items-center gap-2 cursor-pointer ml-24">
        <input
          type="radio"
          name="gender"
          value="M"
          checked={formData.gender === "M"}
          onChange={handleChange}
          className="accent-blue-500"
        />
        <span className="text-gray-700">Male</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer ml-6">
        <input
          type="radio"
          name="gender"
          value="F"
          checked={formData.gender === "F"}
          onChange={handleChange}
          className="accent-blue-500"
        />
        <span className="text-gray-700">Female</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer ml-6">
        <input
          type="radio"
          name="gender"
          value="O"
          checked={formData.gender === "O"}
          onChange={handleChange}
          className="accent-blue-500"
        />
        <span className="text-gray-700">Other</span>
      </label>
    </div>

    {errors.gender && (
      <p className="text-red-500 text-sm">{errors.gender}</p>
    )}

    {/* AGE + EDUCATION */}
    <div className="grid grid-cols-2 gap-4">

      <div className="relative">
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
  className="w-full rounded border border-gray-300 px-3 py-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
  placeholder="Enter Age"
/>
{/* <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
    *
  </span> */}
        {errors.age && (
          <p className="text-red-500 text-sm">{errors.age}</p>
        )}
      </div>

     <div className="relative">
  <select
    name="education"
    value={formData.education}
    onChange={handleChange}
    className="w-full rounded border border-gray-300 px-3 py-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
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

  {/* <span className="absolute right-8 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
    *
  </span> */}

  {errors.education && (
    <p className="text-red-500 text-sm">{errors.education}</p>
  )}
</div>

    </div>




                        {/* ACCOUNT TYPE  */}
          <div className="mt-4">
            <div className="w-full rounded border border-gray-300 px-4 py-4 flex items-center gap-28">
              <span className="text-gray-400 whitespace-nowrap">
                Account Type <span className="text-red-500">*</span>
              </span>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="account_type"
                  value="individual"
                  checked={formData.account_type === "individual"}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({
                      ...formData,
                      account_type: value,
                      organization: value === "individual" ? "" : formData.organization,
                    });
                    if (value === "individual") {
                      setSelectedOption(null);
                    }
                  }}
                  
                  className="accent-blue-500"
                />
                <span className="text-gray-700">Individual</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer ml-32">
                <input
                  type="radio"
                  name="account_type"
                  value="org"
                  checked={formData.account_type === "org"}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({
                      ...formData,
                      account_type: value,
                      organization: value === "individual" ? "" : formData.organization,
                    });
                    if (value === "individual") {
                      setSelectedOption(null);
                    }
                  }}
                  
                  className="accent-blue-500"
                />
                <span className="text-gray-700">Organization</span>
              </label>
            </div>
          </div>

          {/* Organization */}
          <div className="relative w-full">
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
                  padding: "8px",
                  height: "50px",
                  borderRadius: "6px",
                  borderColor: "#D1D5DB",
                  backgroundColor:
                    formData.account_type === "individual" ? "#f3f4f6" : "white", // greyed
                  cursor:
                    formData.account_type === "individual"
                      ? "not-allowed"
                      : "default",
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: "#9CA3AF",
                }),
                valueContainer: (provided) => ({
                  ...provided,
                  padding: "0 12px",
                }),
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
            <>
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
    className="mt-3 w-full rounded border border-gray-300 px-4 py-3"
  />
   <p className="mt-2 text-sm text-amber-600">
      Note: If your organization is not listed, please enter its name here.
      Our team will review and add it to the organization directory.
    </p>
    </>
)}


          <div className="grid grid-cols-2 gap-4">
            {/* Password Field */}

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                autoComplete="off"
                onFocus={() => setShowPasswordRules(true)}
                onBlur={() => setShowPasswordRules(false)} // ✅ Hide rules when moving to another field
                className="w-full rounded border border-gray-300 pl-10 pr-10 py-4 e placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="Enter password"
              />
              <span className="absolute right-56 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
                *
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>

              {/* Password Rules (Hide on blur) */}
              {showPasswordRules && (
                <div className="absolute top-full left-0 w-full mt-2 p-2 bg-gray-100 border rounded-lg text-sm text-gray-700 shadow-lg">
                  <p className="font-medium">Password must include:</p>
                  <ul className="list-disc ml-5">
                    {passwordRequirements.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <div className="relative">
                <input
                  name="password_confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.password_confirm}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 pl-10 pr-3 py-4  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Re-Enter password "
                />
                <span className="absolute right-52 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
                  *
                </span>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {errors.password_confirm && (
                <p className="text-red-500 text-sm">
                  {errors.password_confirm}
                </p>
              )}
            </div>
          </div>



          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="px-4 py-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 flex items-center"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Submit
            </button>
          </div>
          <div className="text-center">
            <p className="text-gray-600">
              Aready have an account?{" "}
              <span
                onClick={handleloginRedirect}
                className="text-blue-500 cursor-pointer hover:underline"
              >
                Login here
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
