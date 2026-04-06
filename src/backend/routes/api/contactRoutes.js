const express = require('express');
const router = express.Router();
const { sendContactMessage } = require('../../controllers/contact/contactController');

router.post('/', sendContactMessage);

module.exports = router;