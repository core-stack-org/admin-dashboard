// constants.js
import SettlementIcon from "../../icons/settlement_icon.svg";
import WellIcon from "../../icons/well_icon.svg";
import WaterBodyIcon from "../../icons/waterbodiesScreenIcon.svg";
import RechargeIcon from "../../icons/recharge_icon.svg";
import IrrigationIcon from "../../icons/irrigation_icon.svg";
import LivelihoodIcon from "../../icons/livelihood_proposed.svg";
import CropIcon from "../../icons/crops-svgrepo-com.svg";
import AgrohorticultureIcon from "../../icons/Plantation.svg";

const S3_BASE = `${process.env.REACT_APP_S3_FORM_TEMPLATE}`;

const FORM_S3_KEYS = {
  Settlement: "add_settlements.json",
  Well: "add_well.json",
  Waterbody: "water_structure.json",
  Crop: "cropping_pattern.json",
  Groundwater: "recharge_structure.json",
  Livelihood: "livelihood.json",
  Agri: "irrigation_work.json",
  "Agri Maintenance": "maintenance_irr.json",
  "GroundWater Maintenance": "maintenance_recharge_st.json",
  "Surface Water Body Maintenance": "maintenance_water_structures.json",
  "Surface Water Body Remotely Sensed Maintenance": "maintenance_rs_swb.json",
  Agrohorticulture: "agrohorticulture.json",
};

const formTemplateCache = {};

export const ICONS = {
  Settlement: SettlementIcon,
  Well: WellIcon,
  Waterbody: WaterBodyIcon,
  Crop: CropIcon,
  Groundwater: RechargeIcon,
  Livelihood: LivelihoodIcon,
  Agri: IrrigationIcon,
  "Agri Maintenance": IrrigationIcon,
  "GroundWater Maintenance": RechargeIcon,
  "Surface Water Body Maintenance": WaterBodyIcon,
  "Surface Water Body Remotely Sensed Maintenance": WaterBodyIcon,
  Agrohorticulture: AgrohorticultureIcon,
};

export const BASEURL = `${process.env.REACT_APP_BASEURL}`;

export const FORM_CATEGORY_MAP = {
  // Resource Mapping
  Settlement: "Resource Mapping",
  Well: "Resource Mapping",
  Waterbody: "Resource Mapping",
  Crop: "Resource Mapping",
  // New Demands
  Groundwater: "New Demands",
  Livelihood: "New Demands",
  Agri: "New Demands",
  Agrohorticulture: "New Demands",
  // Maintenance
  "Agri Maintenance": "Maintenance",
  "GroundWater Maintenance": "Maintenance",
  "Surface Water Body Maintenance": "Maintenance",
  "Surface Water Body Remotely Sensed Maintenance": "Maintenance",
  // Feedback
  "Feedback Agri": "Feedback",
  "Feedback Groundwater": "Feedback",
  "Feedback Surface Water Bodies": "Feedback",
};

export const FORM_DISPLAY_NAMES = {
  Waterbody: "Water Structures",
  Crop: "Cropping Pattern",
  Groundwater: "Recharge Structures",
  Agri: "Irrigation Structures",
  "Agri Maintenance": "Irrigation Structure Maintenance",
  "GroundWater Maintenance": "Recharge Structure Maintenance",
};

export const FORM_CATEGORY_ORDER = [
  "Resource Mapping",
  "New Demands",
  "Maintenance",
  "Feedback",
];

export const getFormTemplate = async (formName) => {
  // Return from cache if already fetched
  if (formTemplateCache[formName]) return formTemplateCache[formName];

  const filename = FORM_S3_KEYS[formName];
  if (!filename) return null;

  try {
    const res = await fetch(`${S3_BASE}/${filename}`);
    if (!res.ok) throw new Error(`Failed to fetch ${filename}`);
    const json = await res.json();
    formTemplateCache[formName] = json;
    return json;
  } catch (err) {
    console.error(`Form template fetch error for ${formName}:`, err);
    return null;
  }
};

export const CARD_DISPLAY_FIELDS = {
  Settlement: [
    { key: "Settlements_id", label: "Settlement's ID" },
    { key: "Settlements_name", label: "Settlement's name" },
    {
      key: "number_households",
      label: "How many households are there in this settlement?",
    },
    {
      key: "farmer_family-marginal_farmers",
      label: "Number of farmers with land < 2.5 acres",
    },
  ],

  Well: [
    {
      key: "beneficiary_settlement",
      label: "Name of Beneficiary's Settlement",
    },
    { key: "select_one_well_type", label: "Well Type" },
    { key: "select_one_owns", label: "Who owns the well?" },
    { key: "Beneficiary_name", label: "Beneficiary's name" },
    {
      key: "Well_usage-is_maintenance_required",
      label: "Does the well require maintenance?",
    },
  ],

  Waterbody: [
    {
      key: "beneficiary_settlement",
      label: "Name of Beneficiary's Settlement",
    },
    {
      key: "select_one_water_structure",
      label: "Type of water structure",
    },
    {
      key: "select_one_owns",
      label: "Who owns the Water structure in this settlement?",
    },
    {
      key: "select_one_maintenance",
      label: "Does the water structure require repair maintenance?",
    },
  ],

  Crop: [
    {
      key: "beneficiary_settlement",
      label: "Name of Beneficiary's Settlement",
    },
    {
      key: "select_one_classified",
      label: "What is this land classified as?",
    },
    {
      key: "select_one_practice",
      label: "Which cropping seasons do you practice in this settlement?",
    },
  ],

  Groundwater: [
    {
      key: "beneficiary_settlement",
      label: "Name of Beneficiary's Settlement",
    },
    { key: "demand_type", label: "Type of demand" },
    { key: "Beneficiary_Name", label: "Beneficiary's Name" },
    {
      key: "TYPE_OF_WORK_ID",
      label: "Select the work demand required for recharge in the settlement",
    },
  ],

  Livelihood: [
    {
      key: "beneficiary_settlement",
      label: "Name of Beneficiary's Settlement",
    },
    {
      key: "beneficiary_name",
      label: "Beneficiary's Name",
    },
    {
      key: "Livestock-is_demand_livestock",
      label: "Livestock Demand?",
    },
    {
      key: "Livestock-ben_livestock",
      label: "Livestock Beneficiary",
    },
    {
      key: "kitchen_gardens-assets_kg",
      label: "Kitchen Garden Demand?",
    },
    {
      key: "kitchen_gardens-ben_kitchen_gardens",
      label: "Kitchen Garden Beneficiary",
    },
    {
      key: "fisheries-is_demand_fisheries",
      label: "Fisheries Demand?",
    },
    {
      key: "fisheries-ben_fisheries",
      label: "Fisheries Beneficiary",
    },
  ],

  Agri: [
    {
      key: "beneficiary_settlement",
      label: "Name of Beneficiary's Settlement",
    },
    { key: "demand_type_irrigation", label: "Type of demand" },
    { key: "Beneficiary_Name", label: "Beneficiary's Name" },
    {
      key: "TYPE_OF_WORK_ID",
      label: "Select the type of Irrigation work in this settlement",
    },
  ],

  "Agri Maintenance": [
    {
      key: "beneficiary_settlement",
      label: "Name of Beneficiary's Settlement",
    },
    { key: "demand_type", label: "Type of demand" },
    { key: "Beneficiary_Name", label: "Beneficiary Name" },
    {
      key: "select_one_irrigation_structure",
      label:
        "Select the type of repair maintenance required in this irrigation structure ?",
    },
  ],

  "GroundWater Maintenance": [
    {
      key: "beneficiary_settlement",
      label: "Name of Beneficiary's Settlement",
    },
    { key: "demand_type", label: "Type of demand" },
    { key: "Beneficiary_Name", label: "Beneficiary Name" },
    {
      key: "select_one_recharge_structure",
      label:
        "Select the visible repairs or maintenance issues for the recharge structures?",
    },
  ],

  "Surface Water Body Maintenance": [
    {
      key: "beneficiary_settlement",
      label: "Name of Beneficiary's Settlement",
    },
    { key: "demand_type", label: "Type of demand" },
    { key: "Beneficiary_Name", label: "Beneficiary Name" },

    {
      key: "select_one_recharge_structure",
      label:
        "Select the visible repairs or maintenance issues for the recharge structures?",
    },
  ],

  "Surface Water Body Remotely Sensed Maintenance": [
    {
      key: "beneficiary_settlement",
      label: "Name of Beneficiary's Settlement",
    },
    { key: "demand_type", label: "Type of demand" },
    { key: "Beneficiary_Name", label: "Beneficiary Name" },
    {
      key: "TYPE_OF_WORK",
      label: "Select the type of surface water structure repair work",
    },
  ],

  Agrohorticulture: [
    {
      key: "beneficiary_settlement",
      label: "Name of Beneficiary Settlement",
    },
    {
      key: "select_one_y_n",
      label: "Are there demands for plantation in the settlement",
    },
    { key: "demand_type_plantations", label: "Type of Demand" },
    {
      key: "beneficiary_name",
      label: "Beneficiary Name",
    },
  ],
};


export const structureRules = {
  "Staggered Contour trenches (SCT)": "staggered_contour_trenches_sct",
  "Check dam": "check_dam",
  "Percolation tank": "percolation_tank",
  "Earthen gully plug": "earthen_gully_plug",
  "Drainage/soakage channels": "drainage_soakage_channels",
  "Recharge pits": "recharge_pits",
  "Soakage pits": "soakage_pits",
  "Trench cum bund network": "trench_cum_bund_network",
  "Continuous contour trenches (CCT)": "continuous_contour_trenches_cct",
  "Water absorption trenches (WAT)": "water_absorption_trenches_wat",
  "Loose Boulder Structure": "loose_boulder_structure",
  "Rock fill dam": "rock_fill_dam",
  "Stone bunding": "stone_bunding",
  "Diversion drains": "diversion_drains",
  "Bunding:Contour bunds/ graded bunds": "contour_bund",
  "5% model structure": "5_percent_model_structure",
  "30-40 model structure": "30_40_model_structure",
  "Farm pond": "farm_pond",
  "Community Pond": "community_pond",
  "Well": "well",
  "Canal": "canal",
  "Farm bund": "farm_bund",
  "Large water body": "large_water_body"
}

// Config: if this field has this value → hide Beneficiary_Name in card
export const BENEFICIARY_VISIBILITY_RULES = {
  Well: {
    field: "select_one_owns",
    hideWhenValue: "Public well",
  },
  Groundwater: {
    field: "demand_type",
    hideWhenValue: "Community_demand",
  },
  Agrohorticulture: {
    field: "demand_type_plantations",
    hideWhenValue: "Community_demand",
  },
  "Surface Water Body Maintenance": {
    field: "demand_type",
    hideWhenValue: "Community_demand",
  },
  Agri: {
    field: "demand_type_irrigation",
    hideWhenValue: "Community_demand",
  },
  "Surface Water Body Remotely Sensed Maintenance": {
    field: "demand_type",
    hideWhenValue: "Community_demand",
  },
  "Agri Maintenance": {
    field: "demand_type",
    hideWhenValue: "Community_demand",
  },
  "GroundWater Maintenance": {
    field: "demand_type",
    hideWhenValue: "Community_demand",
  },
};

export const shouldHideBeneficiaryName = (formName, submission) => {
  const rule = BENEFICIARY_VISIBILITY_RULES[formName];
  if (!rule) return false;

  const fieldValue = submission[rule.field];
  return fieldValue === rule.hideWhenValue;
};

const SYSTEM_FIELD_NAMES = new Set([
  "GPS_point",
  "block_name",
  "plan_id",
  "plan_name",
  "user_latlon",
  "sett_note_3",
  "sett_note_4",
  "well_note_1",
  "rech_strc_note_1",
  "crop_note_1",
  "crop_note_2",
  "note",
  "question1",
  "crop_Grid_id",
  "work_id",
  "corresponding_work_id"
]);


const SYSTEM_FIELD_TYPES = new Set(["html"]);

export const stripSystemFields = (schema) => {
  if (!schema?.pages) return schema;

  const filterElements = (elements) =>
    elements
      .filter(
        (el) =>
          !SYSTEM_FIELD_NAMES.has(el.name) &&
          !SYSTEM_FIELD_TYPES.has(el.type)
      )
      .map((el) => {
        if (el.type === "panel" && Array.isArray(el.elements)) {
          return { ...el, elements: filterElements(el.elements) };
        }
        return el;
      });

  return {
    ...schema,
    pages: schema.pages.map((page) => ({
      ...page,
      elements: filterElements(page.elements || []),
    })),
  };
};

export const LANGUAGE_MAP = {
  "en": "English",
  "hi": "Hindi",
  "gu": "Gujarati",
  "kn": "Kannada",
  "or": "Odia",
};
