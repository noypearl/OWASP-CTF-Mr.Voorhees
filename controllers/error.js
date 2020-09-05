const path = require('path');

const returnErrorPage = (req, res) => {
    res.sendFile(path.join(__dirname , 'public', 'error.html'));
}

module.exports = returnErrorPage;