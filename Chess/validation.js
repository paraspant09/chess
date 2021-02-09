//Validation
const Joi=require('@hapi/joi');

//Register Validation
const authValidation=(body)=>{
  const schema=Joi.object({
    name:Joi.string().min(6).required(),
    password:Joi.string().min(6).required()
  });
  return schema.validate(body);
}

exports.authValidation=authValidation;
