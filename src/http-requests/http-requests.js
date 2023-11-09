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

export async function DownloadPath(path, filename) {
  path = encodeURIComponent(path);

  try {
    let response = await axios({
      url: `${GetServerUrl()}/data/download/${path}`,
      method: 'GET',
      responseType: 'blob',
    });

    const href = URL.createObjectURL(response.data);

    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    return {
      error: false,
      data: null,
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

export async function UploadFile(path, file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    let response = await axios.post(GetServerUrl() + `/data/upload/${encodeURIComponent(path)}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return {
      error: false,
      data: null,
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

export async function DeletePath(path) {
  try {
    let response = await axios.delete(GetServerUrl() + `/data/delete/${encodeURIComponent(path)}`);
    return {
      error: false,
      data: null,
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