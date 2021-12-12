'use strict'
var rp = require('request-promise');

exports.getDetails = async function(req, res, next) {
  
  
  console.log(req.body);
  //req.body.lang_model
  let lang_model=req.body.lang_model;
  let name=req.body.name;
  let mobileno=req.body.mobileno;
  let sex=req.body.sex;
  let age=Number(req.body.age);
  let symptoms=req.body.symptoms;
  let result;

  var uri='https://api.infermedica.com/covid19/diagnosis'

  var triageIds=['p_12','p_13','p_14','p_11','p_15','s_14'];
  var isTriage=false;
  var evidence=[];

  if((undefined!=sex) && (NaN!=age)){

    
    if(symptoms!=undefined){
      symptoms.forEach(element => {

        if(element!=null&&element!=''){
          var id=element.split('-')[0];
       var choice_id=element.split('-')[1];

        var el={
          'id':id,
          'choice_id':choice_id
        };
        evidence.push(el);

        if(triageIds.indexOf(id)>-1){
          isTriage=true;
          uri='https://api.infermedica.com/covid19/triage';
        }
        }
      });
    }

    console.log(evidence);


    rp({
      method: 'POST',
      uri: uri,
      headers: {
        'Content-Type': 'application/json',
        'App-Id': '41dde73a',
        'App-Key': '51031f2c5213f5f10e5955d6a6dae006',
        'Model': lang_model
      },
      body: {
          'sex' : sex,
          'age' : age,
          'evidence':evidence
      },
      async: true,
      json: true // Automatically stringifies the body to JSON
  }).then(function(body){
    console.log('parsed');
    result=body;
    
  }).catch(function(err){
    console.log('error');
   // console.log(err);
  }).done(()=>{
    
    if(!isTriage
      && result!=undefined&&result.question!=undefined&&result.question.items!=undefined){
       // console.log(result.question.items);
        //console.log(result.question.items[0].choices);
      res.render('diagonise',{
        data: result.question.items,
        name:name,
        mobileno:mobileno,
        sex: sex,
        age: age,
        symptoms: symptoms,
        evidence:evidence,
        lang_model:lang_model,
        questionType:result.question.type
      });  
    }else if(isTriage){
      //console.log(result);
      //console.log(req.body);
      var emergencyflag=false;

      if(result.serious!=undefined&&result.serious!=null){
        result.serious.forEach(element => {
          emergencyflag=emergencyflag==true||element.is_emergency==true;
        });
      }
      
      let label=result.label==null?'Preventive Measures':result.label;

      let description=result.description==null?
      'Follow Preventive Measures!! Follow atleast 1 meter social distancing!! Use Hand Sanitizers regularly!! If you You have traveled any affected countries, please consult nearest health care provider and follow self quarantine ':
      result.description+'please consult nearest health care provider and follow self quarantine';

      let is_emergency=emergencyflag?'Yes':'No';


      // CREATE REQUEST OBJECT FOR INSERT PATIENT OPERATION

      let serious=result.serious!=undefined&&result.serious!=null&&(result.serious).length>0?JSON.stringify(result.serious):'';

      var utcTimeStamp=
      (new Date().getUTCFullYear()<10?('0'+new Date().getUTCFullYear()):new Date().getUTCFullYear())+'-'+
      (new Date().getUTCMonth()+1<10?('0'+(new Date().getUTCMonth()+1)):(new Date().getUTCMonth()+1))+'-'+
      (new Date().getUTCDate()<10?('0'+new Date().getUTCDate()):new Date().getUTCDate())+' '+
      (new Date().getUTCHours()<10?('0'+new Date().getUTCHours()):new Date().getUTCHours())+'-'+
      (new Date().getUTCMinutes()<10?('0'+new Date().getUTCMinutes()):new Date().getUTCMinutes())+'-'+
      (new Date().getUTCSeconds()<10?('0'+new Date().getUTCSeconds()):new Date().getUTCSeconds());
    

      var request_object={
          mobile_no:req.body.mobileno,
          triage_level:result.triage_level!=undefined&&result.triage_level!=null?result.triage_level:'',
          label:result.label,
          description:result.description,
          serious:serious,
          root_cause:'',
          checked_datetime:utcTimeStamp,
        };
      
      exports.insertPatient(request_object);
    

    res.render('triage',{
        label:label,
        description:description,
        is_emergency:is_emergency,
        lang_model:lang_model,
        name:name,
        mobileno:mobileno,
        sex: sex,
        age: age,
        evidence:evidence
      });  
    }else{
      res.render('diagonise');
    }
  });
  }
  };

  exports.insertPatient = async function(request_object) {
  
    let result;
    console.log('insert patient request');
    console.log(request_object);

    return await new Promise(function(resolve, reject) {
    
          rp({
            method: 'POST',
            uri: 'http://52.172.152.59:8000/api/rest/V1/symptomschecker/InsertPatientCovid19',
            headers: {
              'Authorization':'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI1NywiaXNzIjoiaHR0cDovL2FkbWluLm15YWlidWQuY29tL2FwaS9yZXN0L1YxL2F1dGhlbnRpY2F0ZS9sb2dpbiIsImlhdCI6MTU4NDY0MjEwMiwiZXhwIjoxNTg1ODUxNzAyLCJuYmYiOjE1ODQ2NDIxMDIsImp0aSI6IkJITWhMWnFLa0pCbTRRRlQifQ.m8fHcpvdOCZtiFfo7yxKwV40LkMG1iLDaXFR3w8KBIU',
              'Content-Type': 'application/json',
              'Accept': '*/*',
              'Accept-Encoding': 'gzip, deflate, br',
              'Connection':'keep-alive',
            },
            body: request_object,
            async: true,
            json: true // Automatically stringifies the body to JSON
        }).then(function(body){
          result=body;
          console.log('insertion result');
          console.log(result);
          resolve(result);
        }).catch(function(err){
          console.log('insertion error');
          console.log(err);
          reject(err);
        });

  });
    
  
  
  
  
  };