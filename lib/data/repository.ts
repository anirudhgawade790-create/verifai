import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Application, Database, Document } from "../types";
import { demoData } from "./seed";

const filePath = path.join(process.cwd(), "data", "applications.json");
let writeQueue: Promise<void> = Promise.resolve();

async function ensureSeed(): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  try {
    await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    await writeFile(filePath, `${JSON.stringify(demoData, null, 2)}\n`, "utf8");
  }
}

async function readData(): Promise<Database> {
  await ensureSeed();
  const contents = await readFile(filePath, "utf8");
  return JSON.parse(contents.charCodeAt(0) === 0xfeff ? contents.slice(1) : contents) as Database;
}

export async function getApplications(): Promise<Application[]> {
  return (await readData()).applications;
}

export async function getApplication(id: string): Promise<Application | undefined> {
  return (await readData()).applications.find((application) => application.id === id);
}

export async function updateApplication(id: string, update: (application: Application) => Application): Promise<Application | undefined> {
  let result: Application | undefined;
  writeQueue = writeQueue.then(async () => {
    const data = await readData();
    const index = data.applications.findIndex((application) => application.id === id);
    if (index < 0) return;
    data.applications[index] = update(data.applications[index]);
    result = data.applications[index];
    const temporaryPath = `${filePath}.tmp-${process.pid}`;
    await writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    await rename(temporaryPath, filePath);
  });
  await writeQueue;
  return result;
}

export async function findUserByEmail(email: string) {
  return (await readData()).users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export async function addDocument(applicationId: string, document: Document): Promise<Application | undefined> {
  return updateApplication(applicationId, (application) => ({
    ...application,
    documents: [...application.documents, document],
    status: "Verification Pending",
    updatedAt: document.uploadedAt,
  }));
}

export async function getInstitutions() {
  return (await readData()).institutions;
}

export async function getUsers() {
  return (await readData()).users;
}

export async function createApplication(application: Application): Promise<Application> {
  await writeQueue;
  writeQueue = writeQueue.then(async () => {
    const data = await readData();
    data.applications.push(application);
    const temporaryPath = `${filePath}.tmp-${process.pid}`;
    await writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    await rename(temporaryPath, filePath);
  });
  await writeQueue;
  return application;
}
