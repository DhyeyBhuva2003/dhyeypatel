import apiClient from "@/api/client";

export const uploadService = {
  async upload(file: File, folder = "portfolio") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await apiClient.post("/admin/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export default uploadService;
