import { FORM_ICON_RULES } from "./iconRules";
import { ICONS } from "./constants"; 

export const getDynamicMarkerIcon = (formType, submission) => {
  const rule = FORM_ICON_RULES[formType];
  if (!rule) return ICONS[formType];

  const q = rule.question;

  
  

  let answer =
    submission?.[q] ||
    submission?.data?.[q] ||
    submission?.data_waterbody?.[q] ||
    submission?.data_groundwater?.[q] ||
    submission?.Groundwater?.[q];

    if (!answer && formType === "Well") {
        answer = submission?.Well_usage?.is_maintenance_required;
        }


  if (!answer) return rule.defaultIcon || ICONS[formType];

  const normalize = (v) =>
    v
      ?.toString()
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const answerNorm = normalize(answer);

  const matchedKey = Object.keys(rule.icons || {}).find(
    (k) => normalize(k) === answerNorm
  );


  return matchedKey
    ? rule.icons[matchedKey]
    : rule.defaultIcon || ICONS[formType];
};
