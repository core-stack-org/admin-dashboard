import { useEffect, useRef, useState } from "react";
import { Check, CheckCircle2, ChevronRight, Copy, XCircle } from "lucide-react";
import { Card, CardBody } from "./locationFields";

const CopyTaskId = ({ taskId }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(taskId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy task ID ${taskId}`}
      className="inline-flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-md font-mono text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
    >
      {taskId.slice(0, 8)}
      {copied ? (
        <Check size={12} className="text-emerald-600" />
      ) : (
        <Copy size={12} />
      )}
    </button>
  );
};

const LayerList = ({ title, layers, kind, defaultOpen }) => (
  <details open={defaultOpen} className="group border-t border-gray-100">
    <summary className="flex items-center gap-2 px-5 py-3 cursor-pointer select-none list-none text-sm font-medium text-gray-700 hover:bg-gray-50">
      <ChevronRight
        size={16}
        className="text-gray-400 transition-transform group-open:rotate-90"
      />
      {title}
      <span className="text-gray-400 font-normal">({layers.length})</span>
    </summary>
    <ul className="divide-y divide-gray-100 border-t border-gray-100">
      {layers.map((layer) => (
        <li
          key={`${layer.layer_id}-${layer.layer_name}`}
          className="flex items-center gap-3 px-5 py-2.5"
        >
          <div className="min-w-0 flex-1">
            <p
              className="font-mono text-[13px] text-gray-900 truncate"
              title={layer.layer_name}
            >
              {layer.layer_name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {layer.workspace || <span className="italic">no workspace</span>}
              {layer.layer_type && ` · ${layer.layer_type}`}
            </p>
          </div>
          {kind === "queued" && layer.task_id && (
            <CopyTaskId taskId={layer.task_id} />
          )}
          {kind === "skipped" && (
            <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 ring-1 ring-amber-200">
              {layer.reason || "skipped"}
            </span>
          )}
        </li>
      ))}
    </ul>
  </details>
);

const Stat = ({ label, value, tone }) => (
  <div className="px-5 py-3">
    <p className="text-xs text-gray-500">{label}</p>
    <p className={`text-2xl font-semibold tabular-nums ${tone}`}>{value ?? 0}</p>
  </div>
);

const LayerSource = ({ title, source, breakdown }) => {
  const queued = source.queued_layers || [];
  const skipped = source.skipped_layers || [];
  return (
    <div className="rounded-xl ring-1 ring-gray-200 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {breakdown && <p className="text-xs text-gray-500">{breakdown}</p>}
      </div>
      <div className="grid grid-cols-3 divide-x divide-gray-100">
        <Stat label="Found" value={source.found} tone="text-gray-900" />
        <Stat label="Queued" value={source.queued} tone="text-emerald-600" />
        <Stat
          label="Skipped"
          value={source.skipped_unusable}
          tone={source.skipped_unusable ? "text-amber-600" : "text-gray-900"}
        />
      </div>
      {skipped.length > 0 && (
        <LayerList title="Skipped" layers={skipped} kind="skipped" defaultOpen />
      )}
      {queued.length > 0 && (
        <LayerList title="Queued" layers={queued} kind="queued" />
      )}
    </div>
  );
};

const typeBreakdown = (gee) =>
  ["vector", "raster"]
    .filter((t) => gee[t])
    .map((t) => `${t[0].toUpperCase() + t.slice(1)} ${gee[t].queued}/${gee[t].found}`)
    .join(" · ");

const SyncResult = ({ result, location }) => {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  const { ok, message, data } = result;
  const isSyncResponse = ok && data && ("found" in data || "gee" in data);

  return (
    <div ref={ref} className="scroll-mt-24">
      <Card
        accent={ok ? "emerald" : "red"}
        icon={ok ? CheckCircle2 : XCircle}
        title={ok ? (data?.dry_run ? "Dry run preview" : "Sync queued") : "Sync failed"}
        subtitle={isSyncResponse ? location : message}
        aside={
          isSyncResponse && (
            <div className="flex gap-1.5 shrink-0">
              {data.force && <Chip>Force</Chip>}
              {data.dry_run && <Chip>Dry run</Chip>}
            </div>
          )
        }
      >
        <CardBody>
          {isSyncResponse ? (
            <div className="space-y-4">
              {"found" in data && (
                <LayerSource title="Local layers" source={data} />
              )}
              {data.gee && (
                <LayerSource
                  title="GEE layers"
                  source={data.gee}
                  breakdown={typeBreakdown(data.gee)}
                />
              )}
            </div>
          ) : (
            data && (
              <pre className="max-h-72 overflow-auto text-xs bg-gray-50 ring-1 ring-gray-200 rounded-lg p-4 whitespace-pre-wrap break-all">
                {JSON.stringify(data, null, 2)}
              </pre>
            )
          )}
        </CardBody>
      </Card>
    </div>
  );
};

const Chip = ({ children }) => (
  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 ring-1 ring-gray-200">
    {children}
  </span>
);

export default SyncResult;
