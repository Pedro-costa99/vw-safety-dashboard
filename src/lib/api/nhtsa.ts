import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { parseNhtsaDate } from "../format";

const VPIC_BASE_URL = "https://vpic.nhtsa.dot.gov/api";
const RECALLS_BASE_URL = "https://api.nhtsa.gov/recalls";

export const DEFAULT_MAKE = "volkswagen";
const VOLKSWAGEN_RECALL_SOURCES = [
  { model: "Taos", years: [2021, 2022, 2023, 2024, 2025] },
  { model: "Tiguan", years: [2021, 2022, 2023, 2024, 2025] },
  { model: "Atlas", years: [2020, 2021, 2022, 2023, 2024, 2025] },
  { model: "Jetta", years: [2020, 2021, 2022, 2023, 2024, 2025] },
  { model: "ID.4", years: [2021, 2022, 2023, 2024, 2025] },
];

const baseResponseSchema = z.object({
  Count: z.number().optional(),
  Message: z.string().optional(),
});

const vehicleModelRawSchema = z.object({
  Make_ID: z.number().optional(),
  MakeId: z.number().optional(),
  Make_Name: z.string().optional(),
  MakeName: z.string().optional(),
  Model_ID: z.number().optional(),
  ModelId: z.number().optional(),
  Model_Name: z.string().optional(),
  ModelName: z.string().optional(),
});

const vehicleModelSchema = vehicleModelRawSchema.transform((data) => ({
  Make_ID: data.Make_ID ?? data.MakeId ?? 0,
  Make_Name: data.Make_Name ?? data.MakeName ?? "",
  Model_ID: data.Model_ID ?? data.ModelId ?? 0,
  Model_Name: data.Model_Name ?? data.ModelName ?? "",
}));

const vehicleTypeRawSchema = z.object({
  Make_ID: z.number().optional(),
  MakeId: z.number().optional(),
  Make_Name: z.string().optional(),
  MakeName: z.string().optional(),
  VehicleTypeId: z.number().optional(),
  VehicleTypeName: z.string(),
});

const vehicleTypeSchema = vehicleTypeRawSchema.transform((data) => ({
  Make_ID: data.Make_ID ?? data.MakeId ?? 0,
  Make_Name: data.Make_Name ?? data.MakeName ?? "",
  VehicleTypeId: data.VehicleTypeId ?? null,
  VehicleTypeName: data.VehicleTypeName,
}));

const vinDecodedValueSchema = z.object({
  VIN: z.string().optional(),
  ModelYear: z.string().optional(),
  Make: z.string().optional(),
  Model: z.string().optional(),
  BodyClass: z.string().optional(),
  VehicleType: z.string().optional(),
  PlantCity: z.string().optional(),
  PlantCountry: z.string().optional(),
});

const recallRecordSchema = z.object({
  ReportReceivedDate: z.string(),
  Component: z.string(),
  Summary: z.string(),
  ModelYear: z.string(),
  Make: z.string(),
  Model: z.string(),
  NHTSACampaignNumber: z.string().optional(),
});

const modelsResponseSchema = baseResponseSchema.extend({
  Results: z.array(vehicleModelSchema),
});

const vehicleTypesResponseSchema = baseResponseSchema.extend({
  Results: z.array(vehicleTypeSchema),
});

const vinDecoderResponseSchema = baseResponseSchema.extend({
  Results: z.array(vinDecodedValueSchema),
});

const recallsResponseSchema = z.object({
  results: z.array(recallRecordSchema),
});

const vehicleRecallRecordSchema = z.object({
  Manufacturer: z.string().optional(),
  NHTSACampaignNumber: z.string().optional(),
  ReportReceivedDate: z.string(),
  Component: z.string(),
  Summary: z.string(),
  ModelYear: z.string(),
  Make: z.string(),
  Model: z.string(),
});

const recallsByVehicleResponseSchema = z.object({
  Count: z.number(),
  Message: z.string().optional(),
  results: z.array(vehicleRecallRecordSchema),
});

export type VehicleModel = z.infer<typeof vehicleModelSchema>;
export type VehicleType = z.infer<typeof vehicleTypeSchema>;
export type VinDecodedValue = z.infer<typeof vinDecodedValueSchema>;
export type RecallRecord = z.infer<typeof recallRecordSchema>;
export type ModelsResponse = z.infer<typeof modelsResponseSchema>;
export type VehicleTypesResponse = z.infer<typeof vehicleTypesResponseSchema>;
export type VinDecoderResponse = z.infer<typeof vinDecoderResponseSchema>;
export type RecallsResponse = z.infer<typeof recallsResponseSchema>;
export type VehicleRecallRecord = z.infer<typeof vehicleRecallRecordSchema>;

const fetchFromNhtsa = async <T>(url: string, schema: z.ZodSchema<T>) => {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Falha ao consultar a NHTSA (${response.status})`);
  }

  const data = await response.json();
  return schema.parse(data);
};

const appendFormatParam = (url: string) =>
  url.includes("format=")
    ? url
    : `${url}${url.includes("?") ? "&" : "?"}format=json`;

export const getModelsForMake = async (make: string) => {
  const url = appendFormatParam(
    `${VPIC_BASE_URL}/vehicles/GetModelsForMake/${encodeURIComponent(make)}`
  );
  return fetchFromNhtsa(url, modelsResponseSchema);
};

export const getVehicleTypesForMake = async (make: string) => {
  const url = appendFormatParam(
    `${VPIC_BASE_URL}/vehicles/GetVehicleTypesForMake/${encodeURIComponent(make)}`
  );
  return fetchFromNhtsa(url, vehicleTypesResponseSchema);
};

export const decodeVin = async (vin: string) => {
  const cleanedVin = vin.replace(/[^A-Za-z0-9]/g, "").slice(0, 17);
  const url = appendFormatParam(
    `${VPIC_BASE_URL}/vehicles/DecodeVinValues/${encodeURIComponent(cleanedVin)}`
  );
  return fetchFromNhtsa(url, vinDecoderResponseSchema);
};

export const getRecallsByManufacturer = async (manufacturer: string) => {
  const url = `${RECALLS_BASE_URL}/recallsByManufacturer?manufacturer=${encodeURIComponent(manufacturer)}`;
  return fetchFromNhtsa(url, recallsResponseSchema);
};

const fetchRecallsByVehicle = async (params: {
  make: string;
  model: string;
  modelYear: number;
}) => {
  const url = `${RECALLS_BASE_URL}/recallsByVehicle?make=${encodeURIComponent(
    params.make
  )}&model=${encodeURIComponent(params.model)}&modelYear=${encodeURIComponent(
    String(params.modelYear)
  )}`;

  const response = await fetch(url, {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Falha ao consultar recalls para ${params.model} ${params.modelYear} (${response.status})`
    );
  }

  const data = await response.json();
  return recallsByVehicleResponseSchema.parse(data).results;
};

export const getAggregatedVolkswagenRecalls = async () => {
  const requests = VOLKSWAGEN_RECALL_SOURCES.flatMap((source) =>
    source.years.map((year) => ({
      model: source.model,
      year,
      request: fetchRecallsByVehicle({
        make: DEFAULT_MAKE,
        model: source.model,
        modelYear: year,
      }),
    }))
  );

  const settled = await Promise.allSettled(
    requests.map((item) => item.request)
  );

  const unique = new Map<string, RecallRecord>();

  settled.forEach((result, index) => {
    if (result.status !== "fulfilled") {
      return;
    }

    const { model, year } = requests[index];

    result.value.forEach((record) => {
      const normalized: RecallRecord = {
        ReportReceivedDate: record.ReportReceivedDate,
        Component: record.Component,
        Summary: record.Summary,
        ModelYear: record.ModelYear || String(year),
        Make: record.Make || "VOLKSWAGEN",
        Model: record.Model || model.toUpperCase(),
        NHTSACampaignNumber: record.NHTSACampaignNumber,
      };

      const key = `${normalized.NHTSACampaignNumber ?? normalized.Model}-${normalized.ModelYear}-${normalized.ReportReceivedDate}`;
      if (!unique.has(key)) {
        unique.set(key, normalized);
      }
    });
  });

  const records = Array.from(unique.values()).sort((a, b) => {
    const dateA = parseNhtsaDate(a.ReportReceivedDate);
    const dateB = parseNhtsaDate(b.ReportReceivedDate);
    if (!dateA || !dateB) {
      return 0;
    }
    return dateB.getTime() - dateA.getTime();
  });

  return records;
};

export const nhtsaQueryKeys = {
  modelsForMake: (make: string) => ["nhtsa", "models", make] as const,
  vehicleTypesForMake: (make: string) =>
    ["nhtsa", "vehicle-types", make] as const,
  decodeVin: (vin: string) => ["nhtsa", "vin-decode", vin] as const,
  recallsByManufacturer: (manufacturer: string) =>
    ["nhtsa", "recalls", manufacturer] as const,
  volkswagenRecalls: ["nhtsa", "recalls", "volkswagen"] as const,
};

export const useModelsForMakeQuery = (make: string, enabled = true) =>
  useQuery({
    queryKey: nhtsaQueryKeys.modelsForMake(make),
    queryFn: () => getModelsForMake(make),
    enabled: enabled && Boolean(make),
    staleTime: 1000 * 60 * 30,
  });

export const useVehicleTypesForMakeQuery = (make: string, enabled = true) =>
  useQuery({
    queryKey: nhtsaQueryKeys.vehicleTypesForMake(make),
    queryFn: () => getVehicleTypesForMake(make),
    enabled: enabled && Boolean(make),
    staleTime: 1000 * 60 * 60,
  });

export const useRecallsByManufacturerQuery = (
  manufacturer: string,
  enabled = true
) =>
  useQuery({
    queryKey: nhtsaQueryKeys.recallsByManufacturer(manufacturer),
    queryFn: () => getRecallsByManufacturer(manufacturer),
    enabled: enabled && Boolean(manufacturer),
    staleTime: 1000 * 60 * 10,
  });

export const useVolkswagenRecallsQuery = () =>
  useQuery({
    queryKey: nhtsaQueryKeys.volkswagenRecalls,
    queryFn: () => getAggregatedVolkswagenRecalls(),
    staleTime: 1000 * 60 * 10,
  });
