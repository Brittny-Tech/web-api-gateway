const FormData = require('form-data');

let generateContactForm = (subject, html, from) => {
    let bodyFormData = new FormData();
    bodyFormData.append('subject', subject);
    bodyFormData.append('html', html); 
    bodyFormData.append('from', from); 
    return bodyFormData
}

let checkResponse = (data, expectKey, expectValue) => {
    if(!data || !data[expectKey] || data[expectKey] !== expectValue) {
        return false
    } return true
}


module.exports = {
    generateContactForm,
    checkResponse
}
