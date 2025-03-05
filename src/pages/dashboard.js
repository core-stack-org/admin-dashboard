import React, { useState, useEffect } from "react";
import { Card, CardContent, Button, TextField } from "@mui/material";
import { motion } from "framer-motion";
import AsyncSelect from "react-select/async";

const Dashboard = ({ currentUser }) => {
  console.log(currentUser);
  const orgName = currentUser?.user?.organization_name;
  const userDetails = currentUser?.user;
  const [selectedButton, setSelectedButton] = useState(null);
  const [orgNameInput, setOrgNameInput] = useState("");
  const [orgDescInput, setOrgDescInput] = useState("");
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      console.log("fetch user");
      try {
        const token = sessionStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.REACT_APP_BASEURL}/api/v1/users/`,

          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "420",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          console.log("data of user", data);
          const userOptions = data.map((user) => ({
            label: user.username,
            value: user.id,
          }));
          setUsers(userOptions);
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchOrg = async () => {
      console.log("fetch Org.");
      try {
        const token = sessionStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.REACT_APP_BASEURL}api/v1/auth/register/available_organizations/`,

          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "420",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          console.log("data of org", data);
          const orgOptions = data.map((org) => ({
            label: org.username,
            value: org.id,
          }));
          setOrganizations(orgOptions);
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };

    fetchOrg();
  }, []);

  const filterOptions = (inputValue, options) => {
    return options.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const loadOptions = (inputValue, callback, options) => {
    setTimeout(() => {
      callback(filterOptions(inputValue, options));
    }, 1000);
  };

  const handleButtonClick = (button) => {
    setSelectedButton(button);
  };

  const handleCreateOrganization = async () => {
    console.log("creating org block");
    if (orgNameInput && orgDescInput) {
      try {
        const token = sessionStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.REACT_APP_BASEURL}/api/v1/organizations/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: orgNameInput,
              description: orgDescInput,
            }),
          }
        );

        if (response.ok) {
          alert("Organization created successfully!");
          console.log(await response.json());
        } else {
          alert("Failed to create organization.");
        }
      } catch (error) {
        alert("Failed to create organization.");
        console.error(error);
      }
    } else {
      alert("Please fill all fields");
    }
  };

  const handleMapUserToOrg = async () => {
    if (selectedUser && selectedOrg) {
      console.log("Mapping User to Organization...");
      try {
        const token = sessionStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.REACT_APP_BASEURL}/api/v1/users/map_organization/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              user_id: selectedUser.value,
              organization_id: selectedOrg.value,
            }),
          }
        );

        if (response.ok) {
          alert("User mapped to Organization successfully!");
        } else {
          alert("Failed to map user to organization.");
        }
      } catch (error) {
        console.error("Error Mapping User to Organization:", error);
        alert("Something went wrong.");
      }
    } else {
      alert("Please select both user and organization.");
    }
  };

  return (
    // <div className="min-h-screen bg-[#1e2532] flex p-10 mt-10 gap-10">
    <div className="min-h-screen flex p-10 mt-10 gap-10">
      <div className="flex flex-col space-y-6 w-1/3">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="shadow-lg rounded-2xl bg-[#2a3441] text-white">
            <CardContent className="p-6">
              <h1 className="text-xl font-bold text-center mb-4">
                Welcome to {orgName} Dashboard
              </h1>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="shadow-lg rounded-2xl bg-[#2a3441] text-white">
            <CardContent className="p-4">
              <h2 className="text-lg font-bold text-center mb-4">
                User Details
              </h2>
              <div className="text-sm grid grid-cols-2 gap-4">
                <p className="font-semibold">Username:</p>{" "}
                <p>{userDetails?.username}</p>
                <p className="font-semibold">Email:</p>{" "}
                <p>{userDetails?.email}</p>
                <p className="font-semibold">Name:</p>{" "}
                <p>
                  {userDetails?.first_name} {userDetails?.last_name}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="shadow-lg rounded-2xl bg-[#2a3441] text-white">
            <CardContent className="p-4">
              <h2 className="text-lg font-bold text-center mb-4">
                Super Admin Access
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="contained"
                  className="bg-[#4a5568] text-white"
                  onClick={() => handleButtonClick("Create an Organization")}
                >
                  Create an Organization
                </Button>
                <Button
                  variant="contained"
                  className="bg-[#4a5568] text-white"
                  onClick={() =>
                    handleButtonClick("Map user to an organization")
                  }
                >
                  Map user to an organization{" "}
                </Button>
                <Button
                  variant="contained"
                  className="bg-[#4a5568] text-white"
                  onClick={() =>
                    handleButtonClick("Create project for an organization")
                  }
                >
                  Create project for an organization{" "}
                </Button>
                <Button
                  variant="contained"
                  className="bg-[#4a5568] text-white"
                  onClick={() => handleButtonClick("Assign user to a group")}
                >
                  Assign user to a group{" "}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="shadow-lg rounded-2xl bg-[#2a3441] text-white">
            <CardContent className="p-4">
              <h2 className="text-lg font-bold text-center mb-4">
                Privileged Roles Access
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="contained" className="bg-[#4a5568] text-white">
                  Make user a superadmin{" "}
                </Button>
                <Button variant="contained" className="bg-[#4a5568] text-white">
                  Give user a staff access{" "}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {selectedButton === "Create an Organization" && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          // className="w-1/2 bg-[#2a3441] text-white rounded-2xl shadow-lg p-6 border-2 border-[#4a5568] space-y-12 h-[600px]"
          className="w-1/2 rounded-2xl shadow-lg p-6 border-2 border-[#4a5568] space-y-12 h-[600px]"
        >
          <h2 className="text-lg font-bold mb-4">Create an Organization</h2>
          <TextField
            label="Organization Name"
            variant="outlined"
            fullWidth
            className="bg-white text-black rounded-lg"
            onChange={(e) => setOrgNameInput(e.target.value)}
          />
          <TextField
            label="Organization Description"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            className="bg-white text-black rounded-lg"
            onChange={(e) => setOrgDescInput(e.target.value)}
          />
          <div className="flex justify-center mt-32">
            <Button
              variant="contained"
              className="bg-[#4a5568] text-white mt-8"
              onClick={handleCreateOrganization}
            >
              Submit
            </Button>
          </div>
        </motion.div>
      )}
      {selectedButton === "Map user to an organization" && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-1/2  rounded-2xl shadow-lg p-6 border-2 border-[#4a5568] space-y-6 h-[400px]"

          // className="w-1/2 bg-[#2a3441] text-white rounded-2xl shadow-lg p-6 border-2 border-[#4a5568] space-y-6 h-[400px]"
        >
          <h2 className="text-lg font-bold mb-4">
            Map User to an Organization
          </h2>
          <AsyncSelect
            cacheOptions
            loadOptions={(inputValue, callback) =>
              loadOptions(inputValue, callback, users)
            }
            defaultOptions={users}
            placeholder="Select User"
            classNamePrefix="select"
            onChange={(selectedOption) => setSelectedUser(selectedOption)}
          />

          <AsyncSelect
            cacheOptions
            loadOptions={(inputValue, callback) =>
              loadOptions(inputValue, callback, organizations)
            }
            defaultOptions={organizations}
            placeholder="Select Organization"
            classNamePrefix="select"
            onChange={(selectedOption) => setSelectedOrg(selectedOption)}
          />

          <div className="mt-8 flex justify-center">
            <Button
              variant="contained"
              className="bg-[#4a5568] text-white"
              onClick={handleMapUserToOrg}
            >
              Map User to an Organization
            </Button>
          </div>
        </motion.div>
      )}
      {selectedButton === "Create project for an organization" && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-1/2 rounded-2xl shadow-lg p-6 border-2 border-[#4a5568] space-y-6 h-[500px]"

          // className="w-1/2 bg-[#2a3441] text-white rounded-2xl shadow-lg p-6 border-2 border-[#4a5568] space-y-6 h-[500px]"
        >
          <h2 className="text-lg font-bold mb-4">
            Create project for an organization
          </h2>
          <TextField
            label="Project Name"
            variant="outlined"
            fullWidth
            className="bg-white text-black rounded-lg"
          />
          <TextField
            label="Project Description"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            className="bg-white text-black rounded-lg"
          />
          <AsyncSelect
            cacheOptions
            loadOptions={(inputValue, callback) =>
              loadOptions(inputValue, callback, organizations)
            }
            defaultOptions={organizations}
            placeholder="Select Organization"
            classNamePrefix="select"
          />
          <div className="flex justify-center mt-32">
            <Button
              variant="contained"
              className="bg-[#4a5568] text-white mt-8"
            >
              Submit
            </Button>
          </div>
        </motion.div>
      )}
      {selectedButton === "Assign user to a group" && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-1/2  rounded-2xl shadow-lg p-6 border-2 border-[#4a5568] space-y-6 h-[400px]"

          // className="w-1/2 bg-[#2a3441] text-white rounded-2xl shadow-lg p-6 border-2 border-[#4a5568] space-y-6 h-[400px]"
        >
          <h2 className="text-lg font-bold mb-4">Assign user to a group</h2>
          <AsyncSelect
            cacheOptions
            loadOptions={(inputValue, callback) =>
              loadOptions(inputValue, callback, users)
            }
            defaultOptions={users}
            placeholder="Select User"
            classNamePrefix="select"
          />
          <AsyncSelect
            cacheOptions
            loadOptions={(inputValue, callback) =>
              loadOptions(inputValue, callback, users)
            }
            defaultOptions={users}
            placeholder="Select Group"
            classNamePrefix="select"
          />
          <div className="mt-8 flex justify-center">
            <Button variant="contained" className="bg-[#4a5568] text-white">
              Assign group to user
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
