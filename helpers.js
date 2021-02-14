const FormData = require('form-data');

let generateContactForm = (subject, html, from) => {
    let bodyFormData = new FormData();
    bodyFormData.append('subject', subject);
    bodyFormData.append('html', html); 
    bodyFormData.append('from', from); 
    return bodyFormData
}

let checkResponse = (data, expectKey, expectValue, ctx, next) => {
    if(!data || !data[expectKey] || data[expectKey] !== expectValue) {
        ctx.body = {
        success : false,
        data
        };
        return false
    } return true
}


module.exports = {
    generateContactForm,
    checkResponse
}
