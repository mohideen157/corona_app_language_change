const express = require('express');
const router = express.Router();
var diagonosisController = require('./controllers/diagonosisController');

router.get('/getDetails', (req, res) => {
  res.render('details',{
    lang_model:'infermedica-en'
  });
});

router.post('/getDetails', (req, res) => {
  console.log(req.body);
  let lang_model=req.body.lang_model!=null&&req.body.lang_model!=undefined&&req.body.lang_model!=''?req.body.lang_model:'infermedica-en';
  res.render('details',{
    lang_model:lang_model
  });
});

router.route('/diagonise')
    .post(diagonosisController.getDetails);

module.exports = router;