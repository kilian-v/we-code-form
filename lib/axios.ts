"use server"

import axios from "axios";


const API_URL = process.env.NOTION_API_KEY;

const axiosInstance = axios.create({ baseURL: API_URL });

// Add a request interceptor

export const GET = async (url: string, params?: any) => {
    const response = await axiosInstance.get(`${url}`, {
        ...(params && { params: params }),
    });

    return response.data;
};

export const POST = async (url: string, data: any) => {
    const response = await axiosInstance.post(`${url}`, data);
    return response.data;
};

export const PUT = async (url: string, data: any) => {
    const response = await axiosInstance.put(`${url}`, data);
    return response.data;
};

export const DELETE = async (url: string) => {
    const response = await axiosInstance.delete(`${url}`);
    return response.data;
};
