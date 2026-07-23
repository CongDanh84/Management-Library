const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]).{8,}$/;

function isStrongPassword(password) {
    if(typeof password !== 'string') return false;
    return PASSWORD_REGEX.test(password);
}

module.exports = { isStrongPassword }