const callApi = async (endpoint, payload, done, fail) => {
    try {
        const response = await fetch(endpoint, payload);
        if (response.ok) {
            done(response);
        }
    }
    catch (error) {
        fail(error);
        console.log("smth");
    }
}