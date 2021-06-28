const callApi = async (endpoint, payload, done, fail) => {
    try {
        const response = await fetch(endpoint, payload);
        if (response.ok) {
            done(response);
        }
    }
    catch (error) {
        fail(error);
    }
}

const fadeToggle = (el) => {
    const disp = window.getComputedStyle(el).getPropertyValue('display');

    if (disp == 'none') {
        let op = 0.1;  // initial opacity
        el.style.display = 'block';
        const timer = setInterval(() => {
            if (op >= 1) {
                clearInterval(timer);
            }
            el.style.opacity = op;
            el.style.filter = 'alpha(opacity=' + op * 100 + ")";
            op += op * 0.1;
        }, 10);
    } else {
        let op = 1;  // initial opacity
        const timer = setInterval(() => {
            if (op <= 0.1) {
                clearInterval(timer);
                el.style.display = 'none';
            }
            el.style.opacity = op;
            el.style.filter = 'alpha(opacity=' + op * 100 + ")";
            op -= op * 0.1;
        }, 10);
        setTimeout(() => {
            el.style.display = 'none';
        }, 1000);
    }
}