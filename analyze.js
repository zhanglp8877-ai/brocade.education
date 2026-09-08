const {analyze} = require('../server');

module.exports = async function handler(req,res){
  if(req.method!=='POST'){
    res.setHeader('Allow','POST');
    return res.status(405).json({error:'METHOD_NOT_ALLOWED',message:'此接口只接受 POST 请求。'});
  }
  try{
    return await analyze(req,res);
  }catch(error){
    console.error('Unhandled analyze error',error);
    if(!res.headersSent)return res.status(500).json({error:'INTERNAL_ERROR',message:'分析服务发生内部错误，请稍后重试。'});
  }
};
