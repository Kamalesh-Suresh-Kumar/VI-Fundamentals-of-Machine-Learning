const Loan = require('../models/Loan');

exports.createLoan = async (req, res) => {
  try {
    const loan = new Loan(req.body);
    await loan.save();
    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create loan' });
  }
};

exports.getLoans = async (req, res) => {
  try {
    const loans = await Loan.find();
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch loans' });
  }
};

exports.updateLoan = async (req, res) => {
  try {
    const updatedLoan = await Loan.findOneAndUpdate(
      { id: req.params.id }, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!updatedLoan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    res.json(updatedLoan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update loan' });
  }
};

exports.deleteLoan = async (req, res) => {
  try {
    const deletedLoan = await Loan.findOneAndDelete({ id: req.params.id });
    if (!deletedLoan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    res.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete loan' });
  }
};
