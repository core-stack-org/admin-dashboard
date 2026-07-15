import { useState } from "react";
import {
  Card,
  CardContent,
  Button,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import GenerateApiKeyPage from "./GenerateApiKeyPage";
import { Dialog } from "@headlessui/react";
import { Plug } from "lucide-react";

export default function AppUserDashboard({currentUser}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => { setIsModalOpen(false);};

return (
  <>
    <div className="p-10 bg-white min-h-screen flex flex-col items-center text-gray-900">
      <motion.h1
        className="text-5xl font-bold drop-shadow-lg"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        App User Dashboard
      </motion.h1>

        <div className="w-full max-w-lg mx-auto mt-8">
          <div
          className="cursor-pointer"
          onClick={() => {
            console.log("clicked");
            setIsModalOpen(true);
          }}
        >
          <div className="relative group bg-white border-2 border-gray-200 rounded-[15px] p-5 text-center transition-all duration-300 overflow-hidden shadow-md hover:scale-[1.02] hover:border-indigo-500 min-h-[180px] flex flex-col items-center justify-center">
            <div className="bg-indigo-500 p-3 rounded-full mb-2">
              <Plug className="h-5 w-5 text-white" />
            </div>

            <h3 className="text-[1.1rem] font-semibold text-gray-800 mb-1">
              Generate API Key
            </h3>

            <p className="text-sm text-gray-600">
              Create a secure key for API access
            </p>
          </div>
        </div>
      </div>
    </div>

    <Dialog
      open={isModalOpen}
      onClose={closeModal}
      className="fixed inset-0 z-[999] bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <GenerateApiKeyPage
          closeModal={closeModal}
          currentUser={currentUser}
          isSuperAdmin={false}
        />

        <div className="flex justify-center mt-4">
          <button
            onClick={closeModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  </>
);
}
