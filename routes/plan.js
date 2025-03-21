const { createPlan, getPlans, getPlan, updatePlan, deletePlan } = require('../controllers/plan');
const { authorize, authenticate } = require('../middlewares/authorization');

const router = require('express').Router();

router.post('/create/plan', authorize, createPlan);
router.get('/subcription/plans', authenticate, getPlans);
router.get('/subscription/plan/:planId', authenticate, getPlan);
router.put('/update/plan/:planId', authorize, updatePlan);
router.delete('/delete/plan/:planId', authorize, deletePlan);

module.exports = router;