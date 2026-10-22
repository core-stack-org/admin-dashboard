import { ChevronDown, Info } from "lucide-react";

const ACCENTS = {
  blue: { bar: "bg-blue-500", icon: "bg-blue-50 text-blue-600", step: "text-blue-600" },
  violet: { bar: "bg-violet-500", icon: "bg-violet-50 text-violet-600", step: "text-violet-600" },
  emerald: { bar: "bg-emerald-500", icon: "bg-emerald-50 text-emerald-600", step: "text-emerald-600" },
  red: { bar: "bg-red-500", icon: "bg-red-50 text-red-600", step: "text-red-600" },
};

export const Card = ({ accent = "blue", step, icon: Icon, title, subtitle, aside, children }) => {
  const a = ACCENTS[accent];
  return (
    <section className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm overflow-hidden">
      <div className={`h-1 ${a.bar}`} />
      <header className="flex items-center gap-4 px-8 py-5 border-b border-gray-100">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${a.icon}`}>
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          {step && (
            <p className={`text-[11px] font-semibold uppercase tracking-wider ${a.step}`}>
              Step {step}
            </p>
          )}
          <h2 className="text-lg font-semibold text-gray-900 leading-tight">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {aside}
      </header>
      {children}
    </section>
  );
};

export const CardBody = ({ children }) => (
  <div className="px-8 py-6 space-y-8">{children}</div>
);

export const CardFooter = ({ children }) => (
  <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">{children}</div>
);

export const FormSection = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
      {title}
    </h3>
    {children}
  </div>
);

export const FieldLabel = ({ children }) => (
  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
    {children}
  </label>
);

export const Hint = ({ children }) => (
  <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-amber-50 text-amber-800 text-sm ring-1 ring-amber-200">
    <Info size={16} className="mt-0.5 shrink-0" />
    {children}
  </div>
);

export const SelectField = ({
  label,
  value,
  onChange,
  placeholder,
  disabledHint,
  children,
}) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    {disabledHint ? (
      <Hint>{disabledHint}</Hint>
    ) : (
      <div className="relative">
        <select
          className="w-full appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
          value={value}
          onChange={onChange}
        >
          <option value="">{placeholder}</option>
          {children}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    )}
  </div>
);

// Fetches a sorted location list, e.g. fetchLocationList("get_districts/12", "districts", "district_name")
export const fetchLocationList = async (path, listKey, nameKey) => {
  const res = await fetch(`${process.env.REACT_APP_BASEURL}/api/v1/${path}/`, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      "ngrok-skip-browser-warning": "420",
    },
  });
  const data = await res.json();
  return (data[listKey] || []).sort((a, b) =>
    a[nameKey].localeCompare(b[nameKey])
  );
};
