import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CloudUpload, Loader2 } from "lucide-react";
import layerTypes from "../jsons/syncLayerTypes.json";
import {
  Card,
  CardBody,
  CardFooter,
  FormSection,
  Hint,
  SelectField,
  fetchLocationList,
} from "./locationFields";
import SyncResult from "./syncResult";

// Flatten parents and their children so every layer name is selectable
const flattenLayers = (layers) =>
  layers.flatMap((layer) => [
    { name: layer.name, isChild: false },
    ...(layer.children || []).map((c) => ({ name: c.name, isChild: true })),
  ]);

const LAYER_GROUPS = [
  { label: "Dynamic layers", layers: flattenLayers(layerTypes.dynamic_layers) },
  { label: "Static layers", layers: flattenLayers(layerTypes.static_layers) },
];

const SOURCE_OPTIONS = [
  { value: "local", label: "Local only" },
  { value: "gee", label: "GEE only" },
];

const Toggle = ({ label, description, checked, onChange }) => (
  <label className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg ring-1 ring-gray-200 cursor-pointer hover:bg-gray-50 transition">
    <div>
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full shrink-0 transition-colors ${
        checked ? "bg-violet-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </button>
  </label>
);

const toLocation = (item, nameKey) => ({
  id: item.id,
  name: item[nameKey],
  active_status: item.active_status === true,
});

const SyncGeoserver = ({ prefillState, prefillDistrict, prefillBlock }) => {
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [blocksList, setBlocksList] = useState([]);

  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);

  const [layerType, setLayerType] = useState("");
  const [source, setSource] = useState("");
  const [geeAccounts, setGeeAccounts] = useState({});
  const [geeAccountId, setGeeAccountId] = useState("");
  const [force, setForce] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [skipBoundaries, setSkipBoundaries] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);

  const loadStates = () =>
    fetchLocationList("get_states", "states", "state_name")
      .then(setStatesList)
      .catch(() => toast.error("Failed to load states."));

  const loadDistricts = (stateId) =>
    fetchLocationList(`get_districts/${stateId}`, "districts", "district_name")
      .then(setDistrictsList)
      .catch(() => toast.error("Failed to load districts."));

  const loadBlocks = (districtId) =>
    fetchLocationList(`get_blocks/${districtId}`, "blocks", "block_name")
      .then(setBlocksList)
      .catch(() => toast.error("Failed to load tehsils."));

  const loadGeeAccounts = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/geeaccounts/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "420",
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );
      setGeeAccounts(await res.json());
    } catch {
      toast.error("Failed to load GEE accounts.");
    }
  };

  useEffect(() => {
    loadStates();
    loadGeeAccounts();
  }, []);

  // Mirror whatever is picked in the activate form above
  useEffect(() => {
    if (!prefillState) return;
    setSelectedState(prefillState);
    loadDistricts(prefillState.id);
    setSelectedDistrict(prefillDistrict || null);
    if (prefillDistrict) loadBlocks(prefillDistrict.id);
    else setBlocksList([]);
    setSelectedBlock(prefillBlock || null);
    setResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    prefillState?.id,
    prefillDistrict?.id,
    prefillBlock?.id,
    prefillBlock?.active_status,
  ]);

  const handleStateChange = (e) => {
    const selected = statesList.find((s) => String(s.id) === e.target.value);
    setSelectedState(selected ? toLocation(selected, "state_name") : null);
    setSelectedDistrict(null);
    setSelectedBlock(null);
    setDistrictsList([]);
    setBlocksList([]);
    setResult(null);
    if (selected) loadDistricts(selected.id);
  };

  const handleDistrictChange = (e) => {
    const selected = districtsList.find((d) => String(d.id) === e.target.value);
    setSelectedDistrict(
      selected ? toLocation(selected, "district_name") : null
    );
    setSelectedBlock(null);
    setBlocksList([]);
    setResult(null);
    if (selected) loadBlocks(selected.id);
  };

  const handleBlockChange = (e) => {
    const selected = blocksList.find((b) => String(b.id) === e.target.value);
    setSelectedBlock(selected ? toLocation(selected, "block_name") : null);
    setResult(null);
  };

  const blockInactive = selectedBlock && !selectedBlock.active_status;
  const canSync =
    selectedState && selectedDistrict && selectedBlock && !blockInactive;
  // GEE account only matters when GEE layers are part of the sync
  const includesGee = source !== "local";

  const syncLayers = async () => {
    if (!canSync) return;
    setSyncing(true);
    setResult(null);

    const baseUrl = (process.env.REACT_APP_BASEURL_LC || "").replace(/\/+$/, "");
    try {
      const res = await fetch(
        `${baseUrl}/api/v1/sync_local_layers_to_geoserver/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": process.env.REACT_APP_LC_API_KEY,
          },
          body: JSON.stringify({
            state: selectedState.name,
            district: selectedDistrict.name,
            block: selectedBlock.name,
            ...(layerType && { layer_type: layerType }),
            ...(source && { source }),
            ...(includesGee && geeAccountId && { gee_account_id: geeAccountId }),
            ...(force && { force: true }),
            ...(dryRun && { dry_run: true }),
            ...(skipBoundaries && { skip_boundaries: true }),
          }),
        }
      );

      let data = null;
      try {
        data = await res.json();
      } catch (e) {}

      const queuedCount = (data?.queued || 0) + (data?.gee?.queued || 0);
      const message =
        data?.message ||
        data?.detail ||
        data?.error ||
        (res.ok
          ? `${data?.dry_run ? "Would queue" : "Queued"} ${queuedCount} layer${
              queuedCount === 1 ? "" : "s"
            } for sync.`
          : "Failed to sync layers.");

      setResult({ ok: res.ok, message, data });
      res.ok ? toast.success(message) : toast.error(message);
    } catch {
      setResult({ ok: false, message: "Network error.", data: null });
      toast.error("Network error.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <Card
        step={2}
        accent="violet"
        icon={CloudUpload}
        title="Sync Layers to GeoServer"
        subtitle="Publish an active tehsil's local layers to GeoServer"
      >
        <CardBody>
          <FormSection title="Location">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SelectField
                label="State"
                value={selectedState?.id || ""}
                onChange={handleStateChange}
                placeholder="Select state"
              >
                {statesList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.state_name}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="District"
                value={selectedDistrict?.id || ""}
                onChange={handleDistrictChange}
                placeholder={selectedState ? "Select district" : "—"}
              >
                {districtsList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.district_name}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Tehsil"
                value={selectedBlock?.id || ""}
                onChange={handleBlockChange}
                placeholder={selectedDistrict ? "Select tehsil" : "—"}
              >
                {blocksList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.block_name}
                  </option>
                ))}
              </SelectField>
            </div>

            {blockInactive && (
              <Hint>
                {selectedBlock.name} is not active. Activate it in Step 1
                before syncing.
              </Hint>
            )}
          </FormSection>

          <FormSection title="What to sync">
            <SelectField
              label={
                <>
                  Layer type
                  <span className="text-gray-400 font-normal">(optional)</span>
                </>
              }
              value={layerType}
              onChange={(e) => setLayerType(e.target.value)}
              placeholder="All layers"
            >
              {LAYER_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.layers.map((layer) => (
                    <option key={layer.name} value={layer.name}>
                      {layer.isChild
                        ? `\u00A0\u00A0\u21B3 ${layer.name}`
                        : layer.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </SelectField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label={
                  <>
                    Source
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </>
                }
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="All (local + GEE)"
              >
                {SOURCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </SelectField>

              {includesGee && (
                <SelectField
                  label={
                    <>
                      GEE account
                      <span className="text-gray-400 font-normal">(optional)</span>
                    </>
                  }
                  value={geeAccountId}
                  onChange={(e) => setGeeAccountId(e.target.value)}
                  placeholder="Default account"
                >
                  {Object.entries(geeAccounts).map(([email, accounts]) => (
                    <optgroup key={email} label={email}>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={String(acc.id)}>
                          {acc.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </SelectField>
              )}
            </div>

            <div className="space-y-3">
              <Toggle
                label="Force sync"
                description="Re-sync even if the layer is already on GeoServer"
                checked={force}
                onChange={setForce}
              />
              <Toggle
                label="Skip boundaries"
                description="Don't push the tehsil's panchayat_boundaries and mws layers"
                checked={skipBoundaries}
                onChange={setSkipBoundaries}
              />
              <Toggle
                label="Dry run"
                description="Preview what would be queued without queuing anything"
                checked={dryRun}
                onChange={setDryRun}
              />
            </div>
          </FormSection>
        </CardBody>

        <CardFooter>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-gray-500 min-w-0 truncate">
              {canSync ? (
                <>
                  <span className="font-medium text-gray-900">
                    {selectedBlock.name}
                  </span>
                  , {selectedDistrict.name}, {selectedState.name}
                  {layerType && (
                    <span className="font-mono text-xs"> · {layerType}</span>
                  )}
                </>
              ) : (
                "Select an active tehsil to sync."
              )}
            </p>
            <button
              type="button"
              onClick={syncLayers}
              disabled={!canSync || syncing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors bg-violet-600 text-white hover:bg-violet-700 disabled:bg-violet-300 disabled:cursor-not-allowed"
            >
              {syncing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CloudUpload size={16} />
              )}
              {syncing
                ? dryRun
                  ? "Previewing..."
                  : "Syncing..."
                : dryRun
                ? "Preview sync"
                : "Sync to GeoServer"}
            </button>
          </div>
        </CardFooter>
      </Card>

      {result && (
        <SyncResult
          result={result}
          location={`${selectedBlock?.name}, ${selectedDistrict?.name}, ${selectedState?.name}`}
        />
      )}
    </>
  );
};

export default SyncGeoserver;
