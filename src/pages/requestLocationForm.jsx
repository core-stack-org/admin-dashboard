import React from "react";

const RequestLocationForm = () => {
  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
        Request Data Layers
      </h2>

      <div className="w-full h-[90vh]">
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSesYshZg_HmNc0FgF-JSBye-AeN6mdyrhF2cjGmqLYeD7WgZA/viewform?embedded=true"
          width="100%"
          height="100%"
          title="Request Data Layers Form"
        >
          Loading…
        </iframe>
      </div>
    </div>
  );
};

export default RequestLocationForm;
