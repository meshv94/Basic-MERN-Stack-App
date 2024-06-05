const User = require("../models/usersModel");

const checkUserUniqueness = (field, value) => {
    return { error, isUnique } = User.findOne({[field]: value}).exec()
        .then(user => {
            let res = {};
            if (Boolean(user)) {
                res = { error: { [field]: "This " + field + " is not available" }, isUnique: false };
            } else {
                res = { error: { [field]: "" }, isUnique: true };
            }
            return res;
        })
        .catch(err => console.log(err))
}

module.exports = checkUserUniqueness;