const postApi = async (endpoint, data, done, fail) => {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body: data,
            headers: {
                "Content-type": "application/json"
            }
        });
        if (response.ok) {
            done(response);
        }
    }
    catch (error) {
        fail(error);
        console.log("smth");
    }
}