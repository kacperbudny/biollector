import ky from "ky";

export const http = ky.create({
  timeout: 10_000,
});
