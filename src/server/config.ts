import { z } from "zod";

const Config = z.object({
  garmin: z.object({
    mapShareMapId: z.string().nonempty(),
    mapSharePassword: z.string().nonempty(),
  }),
  immich: z.object({
    addr: z.string().nonempty(),
    albumIdWhitelist: z
      .string()
      .transform((value) => value.split(","))
      .pipe(z.array(z.string().uuid()))
      .transform((values) => new Set(values)),
    apiKey: z.string().nonempty(),
  }),
});

export const config = Config.parse({
  garmin: {
    mapShareMapId: process.env["GARMIN_MAPSHARE_MAP_ID"],
    mapSharePassword: process.env["GARMIN_MAPSHARE_PASSWORD"],
  },
  immich: {
    addr: process.env["IMMICH_ADDR"],
    albumIdWhitelist: process.env["IMMICH_ALBUM_ID_WHITELIST"],
    apiKey: process.env["IMMICH_API_KEY"],
  },
});
