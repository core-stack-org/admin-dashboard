import { Fill, Stroke, Style, Text } from "ol/style.js";

import Vector from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import GeoJSON from "ol/format/GeoJSON";

const createTextStyle = (feature, resolution) => {
  return new Text({
    textAlign: "center",
    textBaseline: "middle",
    scale: 1.4,
    text:
      feature.values_.Panchaya_1.charAt(0).toUpperCase() +
      feature.values_.Panchaya_1.slice(1),
    fill: new Fill({ color: "#ffffff" }),
    stroke: new Stroke({ color: "#000000", width: 2 }),
    offsetX: 0,
    offsetY: 0,
    overflow: true,
  });
};

const PanchayatBoundariesStyle = (feature, resolution) => {
  return new Style({
    stroke: new Stroke({
      color: "#292929",
      width: 2.0,
    }),
    fill: new Fill({
      color: "rgba(255, 255, 255, 0)",
    }),
    text: createTextStyle(feature, resolution),
  });
};

export default async function getVectorLayers(
  layer_store,
  layer_name,
  setVisible = true,
  setActive = true,
  resource_type = null,
  plan_id = null,
  district,
  block
) {
  let url =
    layer_store == "drainage"
      ? "https://geoserver.gramvaani.org:8443" +
        "/geoserver/" +
        layer_store +
        "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" +
        layer_store +
        ":" +
        district +
        "_" +
        block +
        "&outputFormat=application/json&screen=main"
      : plan_id == null
      ? "https://geoserver.gramvaani.org:8443" +
        "/geoserver/" +
        layer_store +
        "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" +
        layer_store +
        ":" +
        layer_name +
        "&outputFormat=application/json&screen=main"
      : "https://geoserver.gramvaani.org:8443" +
        "/geoserver/" +
        layer_store +
        "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" +
        layer_store +
        "%3A" +
        resource_type +
        "_" +
        plan_id +
        "_" +
        district +
        "_" +
        block +
        "&outputFormat=application/json&screen=main";

  const vectorSource = new Vector({
    url: url,
    format: new GeoJSON(),
    loader: function (extent, resolution, projection) {
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok for " + layer_name);
          }
          return response.json();
        })
        .then((json) => {
          vectorSource.addFeatures(vectorSource.getFormat().readFeatures(json));
        })
        .catch((error) => {
          console.log(
            `Failed to load the "${layer_name}" layer. Please check your connection or the map layer details.`,
            error
          );
        });
    },
  });

  const wmsLayer = new VectorLayer({
    source: vectorSource,
    visible: setVisible,
    hover: setActive,
    myData: Math.random(),
  });

  if (layer_store == "panchayat_boundaries") {
    wmsLayer.setStyle(PanchayatBoundariesStyle);
  }

  return wmsLayer;
}
