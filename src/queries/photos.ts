import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { API_BASE_URL } from "./shared";

const PHOTOS_QUERY_KEY = "photos";

const UsePhotosResponseDataSchema = z.object({
  assets: z.array(
    z.object({
      id: z.string().min(1),
      exifInfo: z.object({
        description: z.string(),
        imageHeight: z.number(),
        imageWidth: z.number(),
        latitude: z.number(),
        longitude: z.number(),
      }),
      fullUrl: z.string().min(1),
      thumbnailUrl: z.string().min(1),
    }),
  ),
});

const UsePhotosResponseErrorSchema = z.object({
  message: z.string().min(1),
});

const UsePhotosSuccessSchema = z.object({
  data: UsePhotosResponseDataSchema,
  error: z.null().default(null),
});

type UsePhotosData = z.output<typeof UsePhotosSuccessSchema>["data"];

const UsePhotosErrorSchema = z.object({
  data: z.null().default(null),
  error: UsePhotosResponseErrorSchema,
});

type UsePhotosError = z.output<typeof UsePhotosErrorSchema>["error"];

export const usePhotos = <TData = UsePhotosData>(
  { id }: { id: string },
  options: Omit<
    UseQueryOptions<UsePhotosData, UsePhotosError, TData>,
    "initialData" | "queryKey" | "queryFn"
  > = {},
) =>
  useQuery<UsePhotosData, UsePhotosError, TData>({
    queryFn: async ({ signal }) => {
      const res = await fetch(`${API_BASE_URL}/photos/album/${id}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "GET",
        signal,
      });

      if (res.status !== 200) {
        const result = UsePhotosErrorSchema.safeParse(await res.json());
        if (result.success) {
          throw new Error(result.data.error.message);
        }
        throw new Error("Unknown error: Failed to deserialize error response");
      }

      const result = UsePhotosSuccessSchema.safeParse(await res.json());
      if (!result.success) {
        throw new Error("Unknown error: Failed to deserialize response data");
      }
      return result.data.data;
    },
    queryKey: [PHOTOS_QUERY_KEY, id],
    ...options,
  });
