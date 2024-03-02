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
        try {
            var response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/path/${encodeURI(path)}`);
            var req_resp: RequestsResponse = {
                success: true,
                status_code: response.status,
                json_content: response.data,
                description: ""
            }
            return req_resp;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                if (axiosError.response) {
                    var req_resp: RequestsResponse = {
                        success: false,
                        status_code: axiosError.response.status,
                        json_content: axiosError.response.data,
                        description: ""
                    }
                    return req_resp;
                } else {
                    var req_resp: RequestsResponse = {
                        success: false,
                        status_code: -1,
                        json_content: null,
                        description: axiosError.message
                    }
                    return req_resp;
                }

            } else {
                throw error;
            }
        }
    }

}