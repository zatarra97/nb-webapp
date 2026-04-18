import axios, { AxiosRequestConfig } from "axios";
import { toast } from "react-toastify";
import { userPool } from "./cognito";
import { LOCAL_STORAGE_KEYS } from "../constants";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;
const S3_BUCKET = import.meta.env.VITE_S3_MEDIA_BUCKET || "nb-media";
const S3_REGION = import.meta.env.VITE_S3_REGION || "eu-north-1";

export const S3_BASE_URL = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;

// ---------------------------------------------------------------------------
// Auth — silent token refresh
// ---------------------------------------------------------------------------
const silentTokenRefresh = (): Promise<string | null> =>
  new Promise((resolve) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) { resolve(null); return; }
    cognitoUser.getSession((err: Error | null, session: any) => {
      if (err || !session?.isValid()) { resolve(null); return; }
      const newIdToken: string = session.getIdToken().getJwtToken();
      localStorage.setItem(LOCAL_STORAGE_KEYS.ID_TOKEN, newIdToken);
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, session.getAccessToken().getJwtToken());
      localStorage.setItem(LOCAL_STORAGE_KEYS.JWT_TOKEN, newIdToken);
      resolve(newIdToken);
    });
  });

const sessionExpired = (): void => {
  toast.error("Sessione scaduta, esegui nuovamente il login");
  localStorage.clear();
  window.location.href = "/admin/login";
};

// ---------------------------------------------------------------------------
// Axios autenticato
// ---------------------------------------------------------------------------
const apiClient = axios.create();

apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem(LOCAL_STORAGE_KEYS.ID_TOKEN) ||
    localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (r) => r,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await silentTokenRefresh();
      if (newToken) {
        originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${newToken}` };
        return apiClient(originalRequest);
      }
      sessionExpired();
      return new Promise(() => {});
    }
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Public endpoints (no auth)
// ---------------------------------------------------------------------------
export const getPublicList = async (entity: string): Promise<any[]> => {
  const res = await axios.get(`${BACKEND_URL}/${entity}`);
  return res.data;
};

export const getPublicItem = async (entity: string, id: string): Promise<any> => {
  const res = await axios.get(`${BACKEND_URL}/${entity}/${id}`);
  return res.data;
};

// ---------------------------------------------------------------------------
// Admin endpoints (auth required)
// ---------------------------------------------------------------------------
export const adminGetList = async (entity: string): Promise<any[]> => {
  const res = await apiClient.get(`${BACKEND_URL}/admin/${entity}`);
  return res.data;
};

export const adminGetItem = async (entity: string, id: string): Promise<any> => {
  const res = await apiClient.get(`${BACKEND_URL}/admin/${entity}/${id}`);
  return res.data;
};

export const adminCreate = async (entity: string, data: any): Promise<any> => {
  const res = await apiClient.post(`${BACKEND_URL}/admin/${entity}`, data);
  return res.data;
};

export const adminUpdate = async (entity: string, id: string, data: any): Promise<void> => {
  await apiClient.put(`${BACKEND_URL}/admin/${entity}/${id}`, data);
};

export const adminDelete = async (entity: string, id: string): Promise<void> => {
  await apiClient.delete(`${BACKEND_URL}/admin/${entity}/${id}`);
};

export const adminPatch = async (path: string, data: any): Promise<void> => {
  await apiClient.patch(`${BACKEND_URL}/admin/${path}`, data);
};

export const adminPostAction = async (path: string, data: any): Promise<any> => {
  const res = await apiClient.post(`${BACKEND_URL}/admin/${path}`, data);
  return res.data;
};

// ---------------------------------------------------------------------------
// S3 upload
// ---------------------------------------------------------------------------
export const getUploadUrl = async (
  folder: string,
  filename: string,
  contentType: string
): Promise<{ uploadUrl: string; publicUrl: string; s3Path: string }> => {
  const res = await apiClient.post(`${BACKEND_URL}/admin/upload-url`, { folder, filename, contentType });
  return res.data;
};

export const uploadToS3 = async (uploadUrl: string, file: File): Promise<void> => {
  await axios.put(uploadUrl, file, { headers: { "Content-Type": file.type } });
};

export const deleteMedia = async (url: string): Promise<void> => {
  await apiClient.delete(`${BACKEND_URL}/admin/media`, { data: { url } });
};

// ---------------------------------------------------------------------------
// Download file — fetch del blob e trigger download con nome personalizzato.
// Richiede CORS permissivo sul bucket (già configurato in Pulumi: allowedMethods
// include GET e allowedHeaders `*`). Usa questo invece di <a href download>
// perché il download attribute cross-origin è ignorato senza Content-Disposition.
// ---------------------------------------------------------------------------
export const downloadFileAs = async (url: string, filename: string): Promise<void> => {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
};
