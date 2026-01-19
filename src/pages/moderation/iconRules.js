import { WB_ICONS } from "./icons";
import { SWB_MAINT_ICONS } from "./icons";
import { ICONS } from "./constants";
import {RECHARGE_ICONS} from "./icons";
import {WELL} from "./icons";

export const FORM_ICON_RULES = {
  "Waterbody": {
    question: "select_one_water_structure",
    icons: WB_ICONS,
    defaultIcon: ICONS.Waterbody
  },
  "Surface Water Body Maintenance": {
    question: "select_one_recharge_structure", 
    icons: SWB_MAINT_ICONS,
    defaultIcon: ICONS.Waterbody,
  },
  "Surface Water Body Remotely Sensed Maintenance": {
    question: "TYPE_OF_WORK",   
    icons: SWB_MAINT_ICONS,
    defaultIcon: ICONS.Waterbody,
  },
  "Groundwater": {
    question: "TYPE_OF_WORK_ID",   
    icons: RECHARGE_ICONS,
    defaultIcon: ICONS.Groundwater,
  },
  "GroundWater Maintenance": {
    question: "select_one_recharge_structure",   
    icons: RECHARGE_ICONS,
    defaultIcon: ICONS.Groundwater,
  },
  "Well": {
    question: "is_maintenance_required",   
    icons: WELL,
    defaultIcon: ICONS.Well,
  },
  
};