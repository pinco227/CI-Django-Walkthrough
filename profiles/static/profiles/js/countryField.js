const countryField = document.getElementById('id_default_country')
if (!countryField.value) {
    countryField.style.color = '#aab7c4';
}

countryField.addEventListener('change', (e) => {
    if (!countryField.value) {
        countryField.style.color = '#aab7c4';
    } else {
        countryField.style.color = '#000';
    }
});