const express = require('express');
const { createLoan, getLoans, updateLoan, deleteLoan } = require('../controllers/loanController');
const router = express.Router();

router.post('/loans', createLoan);   // POST from ML frontend
router.get('/loans', getLoans);      // GET loans
router.put('/loans/:id', updateLoan); // PUT to update loans
router.delete('/loans/:id', deleteLoan); // DELETE loans

module.exports = router;
