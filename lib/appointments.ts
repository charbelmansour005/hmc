import "server-only";
import { AppointmentRequest } from "@/models/AppointmentRequest";
import { Service } from "@/models/Service";
import { isBookableDate } from "./booking-dates";
import type { AppointmentStatus } from "./categories";
import { connectDB } from "./db";
import { toAppointmentDTO } from "./dto";
import { assertObjectId, badRequest, notFound } from "./http";
import type { AppointmentInput } from "./schemas";
import { getSettings } from "./settings";
import type { AppointmentDTO } from "./types";

export const APPOINTMENTS_PAGE_SIZE = 25;

export async function createAppointment(input: AppointmentInput): Promise<AppointmentDTO> {
  // Honeypot: only bots fill the hidden "website" field.
  if (input.website) throw badRequest("Invalid request.");

  // Only the dates the form offers: the next two weeks, weekends excluded.
  if (!isBookableDate(input.preferredDate)) {
    throw badRequest("Please check the highlighted fields.", {
      preferredDate: "Pick a date from the list.",
    });
  }

  await connectDB();
  // Only what the form offers: a bookable service, in a section that is shown.
  const [service, settings] = await Promise.all([Service.findById(input.serviceId).lean(), getSettings()]);
  if (!service || service.bookAs || settings.hiddenSections.includes(service.category)) {
    throw badRequest("Please check the highlighted fields.", { serviceId: "Choose a service from the list." });
  }

  const doc = await AppointmentRequest.create({
    name: input.name,
    phone: input.phone,
    preferredDate: input.preferredDate,
    service: service._id,
    serviceName: service.bookingLabel ?? service.name,
  });
  return toAppointmentDTO(doc.toObject());
}

export async function listAppointments(query: { status?: AppointmentStatus; page: number }) {
  await connectDB();
  const filter = query.status ? { status: query.status } : {};
  const [total, docs] = await Promise.all([
    AppointmentRequest.countDocuments(filter),
    AppointmentRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * APPOINTMENTS_PAGE_SIZE)
      .limit(APPOINTMENTS_PAGE_SIZE)
      .lean(),
  ]);
  return {
    items: docs.map(toAppointmentDTO),
    total,
    page: query.page,
    pages: Math.max(1, Math.ceil(total / APPOINTMENTS_PAGE_SIZE)),
  };
}

export async function countAppointmentsByStatus(): Promise<Record<AppointmentStatus, number>> {
  await connectDB();
  const rows = await AppointmentRequest.aggregate<{ _id: AppointmentStatus; n: number }>([
    { $group: { _id: "$status", n: { $sum: 1 } } },
  ]);
  const counts: Record<AppointmentStatus, number> = { new: 0, contacted: 0, closed: 0 };
  for (const row of rows) counts[row._id] = row.n;
  return counts;
}

export async function getAppointment(id: string): Promise<AppointmentDTO> {
  assertObjectId(id, "Appointment request");
  await connectDB();
  const doc = await AppointmentRequest.findById(id).lean();
  if (!doc) throw notFound("Appointment request");
  return toAppointmentDTO(doc);
}

export async function setAppointmentStatus(id: string, status: AppointmentStatus): Promise<AppointmentDTO> {
  assertObjectId(id, "Appointment request");
  await connectDB();
  const doc = await AppointmentRequest.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true, runValidators: true },
  ).lean();
  if (!doc) throw notFound("Appointment request");
  return toAppointmentDTO(doc);
}

export async function deleteAppointment(id: string): Promise<void> {
  assertObjectId(id, "Appointment request");
  await connectDB();
  const doc = await AppointmentRequest.findByIdAndDelete(id).lean();
  if (!doc) throw notFound("Appointment request");
}
