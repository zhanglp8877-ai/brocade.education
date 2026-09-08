module.exports = function handler(req,res){
  let provider='未配置';
  try{provider=new URL(process.env.OPENAI_BASE_URL||'https://api.deepseek.com').hostname}catch{}
  return res.status(200).json({
    ok:true,
    runtime:process.version,
    apiConfigured:Boolean(process.env.OPENAI_API_KEY),
    model:process.env.OPENAI_MODEL||'deepseek-v4-flash',
    provider
  });
};
