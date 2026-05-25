export const getPlans = async (
    organizationId,
    page = 1
    ) => {
    const token = sessionStorage.getItem("accessToken");

    const res = await fetch(
    `${process.env.REACT_APP_BASEURL}api/v1/organizations/${organizationId}/watershed/plans/?page=${page}&filter_test_plan=true&is_dpr_reviewed=true&is_completed=true`,
    {
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "1",
        },
    }
    );

    return await res.json();
};

export const getStates = async () => {
  const token = sessionStorage.getItem("accessToken");

  const res = await fetch(
    `${process.env.REACT_APP_BASEURL}/api/v1/get_states/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  return data.states || [];
};

export const getDistricts = async (stateCode) => {
  const res = await fetch(
    `${process.env.REACT_APP_BASEURL}/api/v1/get_districts/${stateCode}/`,
    {
      headers: {
        "content-type": "application/json",
      },
    }
  );

  const data = await res.json();

  return data.districts || [];
};

export const getBlocks = async (districtCode) => {
  const res = await fetch(
    `${process.env.REACT_APP_BASEURL}/api/v1/get_blocks/${districtCode}/`,
    {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "ngrok-skip-browser-warning": "420",
      },
    }
  );

  const data = await res.json();

  return data.blocks || [];
};

export const getGPsTehsilWise = async (planId) => {
  const token = sessionStorage.getItem("accessToken");

  const res = await fetch(
    `${process.env.REACT_APP_BASEURL}api/v1/gp_tehsil_wise/?plan_id=${planId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await res.json();
};

export const mapPlanToGP = async (payload) => {
  const token = sessionStorage.getItem("accessToken");

  const res = await fetch(
    `${process.env.REACT_APP_BASEURL}api/v1/map_plan_to_gp/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  return await res.json();
};


export const exportYuktdharaData = async (gp_Id) => {
  const token = sessionStorage.getItem("accessToken");

  const response = await fetch(
    `${process.env.REACT_APP_BASEURL}api/v1/yuktdhara_data/?gp_id=${gp_Id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to export data");
  }

  return response.blob();
};

export const getGPByCode = async (gpCode) => {
  const token = sessionStorage.getItem("accessToken");

  const res = await fetch(
    `${process.env.REACT_APP_BASEURL}api/v1/get_gp?gram_panchayat_code=${gpCode}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  return data.data || [];
};

export const getGPMapped = async (organizationId, tehsilId) => {
  const token = sessionStorage.getItem("accessToken");

  const res = await fetch(
    `${process.env.REACT_APP_BASEURL}api/v1/get_gp_mapped_with_plan?org_id=${organizationId}&tehsil_id=${tehsilId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  return data.data || [];
};


export const getDistrictOrg = async (
  organizationId
) => {
  const token =
    sessionStorage.getItem("accessToken");

  const res = await fetch(
    `${process.env.REACT_APP_BASEURL}api/v1/get_district_org?org_id=${organizationId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await res.json();
};

export const getTehsilOrg = async (
  organizationId,
  districtId
) => {
  const token =
    sessionStorage.getItem("accessToken");

  const res = await fetch(
    `${process.env.REACT_APP_BASEURL}api/v1/get_tehsil_org?org_id=${organizationId}&district_id=${districtId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await res.json();
};