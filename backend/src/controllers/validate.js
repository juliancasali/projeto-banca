const Joi = require('@hapi/joi')

// Validação de login
const loginValidate = (data) => {
    const schema = Joi.object({
        email: Joi.string()
            .required()
            .email()
            .messages({
                'string.email': 'Formato de email inválido.',
                'any.required': 'O email é obrigatório.'
            }),
        password: Joi.string()
            .trim()
            .required()
            .min(6)
            .max(100)
            .messages({
                'string.min': 'A senha deve ter pelo menos 6 caracteres.',
                'string.max': 'A senha deve ter no máximo 100 caracteres.',
                'any.required': 'A senha é obrigatória.'
            })
    });

    return schema.validate(data)
}

module.exports.loginValidate = loginValidate;
