const express = require('express');
const router = express.Router();
const controller = require('../controllers/contracts/contractsController');

router.get('/', controller.getContracts);
router.post('/', controller.createContract);
router.put('/:id/update-pdf', controller.updateContractPdf);
router.put('/:id/landlord-sign', controller.landlordSign);
router.put('/:id/tenant-sign', controller.tenantSign);

module.exports = router;