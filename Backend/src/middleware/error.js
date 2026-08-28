import { ZodError } from "zod";
export const notFound = (req, res) => res.status(404).json({ success: false, message: "Route not found", code: "NOT_FOUND" });
export const errorHandler = (error, req, res, next) => {
  if (error instanceof ZodError) return res.status(400).json({ success: false, message: "Please check the submitted fields", code: "VALIDATION_ERROR", fields: error.flatten().fieldErrors });
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ success: false, message: status >= 500 ? "Something went wrong" : error.message, code: error.code || "SERVER_ERROR" });
};
