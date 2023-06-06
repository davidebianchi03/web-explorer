import axios from "axios";

export function GetServerUrl() {
    if (process.env.REACT_APP_ENVIRONMENT === 'develop') {
        return (process.env.REACT_APP_USE_HTTPS === 'true' ? 'https' : 'http') +
            '://' + process.env.REACT_APP_SERVER_HOSTNAME +
            ':' + process.env.REACT_APP_SERVER_PORT;
    } else {
        return '';
    }
}

export function GetConnectionsList() {
    axios.get(GetServerUrl() + '/data/connections')
        .then(function (response) {
            // handle success
            console.log(response);
        })
        .catch(function (error) {
            return {
                error: true,
                errorMessage: error.message
            }
        })
        .finally(function () {
            // always executed
        });
}