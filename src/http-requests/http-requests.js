import axios from "axios";

export function GetServerUrl() {
  if (process.env.REACT_APP_ENVIRONMENT === "develop") {
    return (
      (process.env.REACT_APP_USE_HTTPS === "true" ? "https" : "http") +
      "://" +
      process.env.REACT_APP_SERVER_HOSTNAME +
      ":" +
      process.env.REACT_APP_SERVER_PORT
    );
  } else {
    return "";
  }
}

export async function GetConnectionsList() {
  try {
    let response = await axios.get(GetServerUrl() + "/data/connections");
    return {
      error: false,
      data: response.data,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      error: true,
      data: error,
      statusCode: error.response.status,
    };
  }
}

export async function GetChildrenElements(connection_uuid, path) {
  connection_uuid = encodeURIComponent(connection_uuid);
  path = encodeURIComponent(path);
  try {
    let response = await axios.get(
      GetServerUrl() + `/data/children/${connection_uuid}/${path}`
    );
    return {
      error: false,
      data: response.data,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      error: true,
      data: error,
      statusCode: error.response.status,
    };
  }
}
