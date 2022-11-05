const db_user = process.env.DB_USER;
const db_pass = process.env.DB_PASS;
const db_name = process.env.DB_NAME;
const db_service = process.env.DB_SERVICE;

// expose mongourl to app.js
module.exports = { 
    mongoUrl: `mongodb://${db_user}:${db_pass}@${db_service}/${db_name}?authSource=admin`,
};