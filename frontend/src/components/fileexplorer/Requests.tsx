import React from "react";
import axios, { AxiosError } from "axios";

export type RequestsResponse = {
    success: boolean,
    status_code: number,
    json_content: any,
    description: string
}

export class Requests extends React.Component {

    /**
     * 
     * @param path 
     * @returns 
     */
    static async GetChildren(path: string): Promise<RequestsResponse> {
        var req_resp: RequestsResponse
        try {
            var response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/path/${encodeURI(path)}`);
            req_resp = {
                success: true,
                status_code: response.status,
                json_content: response.data,
                description: ""
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                if (axiosError.response) {
                    req_resp = {
                        success: false,
                        status_code: axiosError.response.status,
                        json_content: axiosError.response.data,
                        description: ""
                    }
                } else {
                    req_resp = {
                        success: false,
                        status_code: -1,
                        json_content: null,
                        description: axiosError.message
                    }
                }

            } else {
                throw error;
            }
        }

        return req_resp;
    }

    /**
     * 
     * @param path 
     * @param name 
     * @param is_directory 
     * @param permissions 
     * @returns 
     */
    static async CreatePath(path: string, name: string, is_directory: boolean, permissions: number) {
        var req_resp: RequestsResponse;
        try {
            var response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/path/${encodeURI(path)}`,
                JSON.stringify({
                    name: name,
                    is_directory: is_directory,
                    permissions: permissions.toString()
                })
            );
            req_resp = {
                success: true,
                status_code: response.status,
                json_content: response.data,
                description: ""
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                if (axiosError.response) {
                    req_resp = {
                        success: false,
                        status_code: axiosError.response.status,
                        json_content: axiosError.response.data,
                        description: ""
                    }
                } else {
                    req_resp = {
                        success: false,
                        status_code: -1,
                        json_content: null,
                        description: axiosError.message
                    }
                }

            } else {
                throw error;
            }
        }
        return req_resp;
    }

    /**
     * 
     * @param path 
     * @param filename 
     * @param file 
     * @returns 
     */
    static async UploadFile(path: string, filename: string, file: File) {
        var req_resp: RequestsResponse;
        try {
            const form_data = new FormData();
            form_data.append("file", file);
            form_data.append("filename", filename);
            var response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/upload/${encodeURI(path)}`, form_data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            }
            );
            req_resp = {
                success: true,
                status_code: response.status,
                json_content: response.data,
                description: ""
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                if (axiosError.response) {
                    req_resp = {
                        success: false,
                        status_code: axiosError.response.status,
                        json_content: axiosError.response.data,
                        description: ""
                    }
                } else {
                    req_resp = {
                        success: false,
                        status_code: -1,
                        json_content: null,
                        description: axiosError.message
                    }
                }

            } else {
                throw error;
            }
        }
        return req_resp;
    }

}