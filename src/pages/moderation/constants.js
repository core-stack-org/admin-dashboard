// constants.js

import SettlementForm from "../../templates/add_settlements.json";
import WellForm from "../../templates/add_well.json";
import WaterbodyForm from "../../templates/water_structure.json";
import CropForm from "../../templates/cropping_pattern.json";
import GroundwaterForm from "../../templates/recharge_structure.json";
import LivelihoodForm from "../../templates/livelihood.json";
import AgriForm from "../../templates/irrigation_work.json";
import AgriMaintenanceForm from "../../templates/maintenance_irr.json";
import GroundwaterMaintenanceForm from "../../templates/maintenance_recharge_st.json";
import WaterStructureMaintenanceForm from "../../templates/maintenance_water_structures.json";
import SWBRemotelySensedForm from "../../templates/maintenance_rs_swb.json";

export const BASEURL = `${process.env.REACT_APP_LOCALURL}`;

export const FORM_TEMPLATES = {
  Settlement: SettlementForm,
  Well: WellForm,
  Waterbody: WaterbodyForm,
  Crop: CropForm,
  Groundwater: GroundwaterForm,
  Livelihood: LivelihoodForm,
  Agri: AgriForm,
  "Agri Maintenance": AgriMaintenanceForm,
  "GroundWater Maintenance": GroundwaterMaintenanceForm,
  "Surface Water Body Maintenance": WaterStructureMaintenanceForm,
  "Surface Water Body Remotely Sensed Maintenance":
    SWBRemotelySensedForm,
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
    label:
        "Does the water structure require repair maintenance?",
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
      label:
        "Which cropping seasons do you practice in this settlement?",
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
      label:
        "Select the work demand required for recharge in the settlement",
    },  
  ],

  Livelihood: [
    {
      key: "beneficiary_settlement",
      label: "Name of Beneficiary's Settlement",
    },
    {
      key: "panel1-Livestock-is_demand_livestock",
      label:
        "Are there demands for promoting livestock in the settlement?",
    },
    {
      key: "panel1-Livestock-ben_livestock",
      label: "Beneficiary's Name",
    },
    {
      key: "panel2-kitchen_gardens-assets_kg",
      label:
        "Are there demands for promoting Kitchen Gardens / Didi Badi / Poshan Vatika as Individual assets in the settlement",
    },
    {
      key: "panel2-kitchen_gardens-ben_kitchen_gardens",
      label: "Beneficiary's Name",
    },
    {
      key: "panel3-fisheries-is_demand_fisheries",
      label:
        "Are there demands for promoting fisheries in the settlement?",
    },
    {
      key: "panel3-fisheries-ben_fisheries",
      label: "Beneficiary's Name",
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
        label:
          "Select the type of Irrigation work in this settlement",
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
      label:
        "Select the type of surface water structure repair work",
    },
  ],
};
