// src/index.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./lib/prisma";

import authRoutes       from "./routes/auth";
import userRoutes       from "./routes/users";
import courseRoutes     from "./routes/courses";
import attendanceRoutes from "./routes/attendance";
import staticRoutes     from "./routes/static";

dotenv.config();

const app  = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://headcount-eta.vercel.app", // ✅ Production frontend
  ],
  credentials: true,
}));
app.use(express.json());

// ── Health check ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Public routes (no auth — needed for registration page) ───

app.get("/api/departments/public", async (_req, res) => {
  try {
    const data = await prisma.department.findMany({ orderBy: { name: "asc" } });
    res.json(data);
  } catch { res.status(500).json({ error: "Server error" }); }
});

app.get("/api/programmes/public", async (_req, res) => {
  try {
    const data = await prisma.programme.findMany({
      include: { departments: { include: { department: true } } },
      orderBy: { name: "asc" },
    });
    res.json(data.map(p => ({
      id:            p.id,
      name:          p.name,
      departmentIds: p.departments.map(d => d.departmentId),
      departments:   p.departments.map(d => ({ id: d.departmentId, name: d.department?.name })),
    })));
  } catch { res.status(500).json({ error: "Server error" }); }
});

app.get("/api/courses/public", async (_req, res) => {
  try {
    const data = await prisma.course.findMany({
      include: { department: true },
      orderBy: [{ departmentId: "asc" }, { year: "asc" }],
    });
    res.json(data.map(c => ({
      id: c.id, name: c.name, code: c.code,
      description: c.description, departmentId: c.departmentId,
      department: c.department?.name, year: c.year,
      credits: c.credits, maxEnrollment: c.maxEnrollment,
    })));
  } catch { res.status(500).json({ error: "Server error" }); }
});

// ── Authenticated routes ─────────────────────────────────────
app.use("/api/auth",       authRoutes);
app.use("/api/users",      userRoutes);
app.use("/api/courses",    courseRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api",            staticRoutes);

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
});
