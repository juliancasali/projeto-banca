const User = require('../models/User');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const {loginValidate} = require('./validate')

const userController = {
    login: async function (req, res) {

        try {
            // Validação dos dados
            const {error} = loginValidate(req.body);
            if (error) {
                return res.status(400).json({
                    error: error.message,
                    code: 400
                });

            }
            // Verifica se o usuário existe
            const email = req.body.email.trim().toLowerCase();
            const user = await User.findOne({email})
            if (!user) {
                return res.status(400).json({
                    error: 'Email ou senha incorretos',
                    code: 400
                });
            }

            // Verifica se a senha está correta
            const isPasswordValid = await bcrypt.compare(req.body.password, user.password)
            if (!isPasswordValid) {
                return res.status(400).json({
                    error: 'Email ou senha incorretos',
                    code: 400
                });
            }

            // Gera o token JWT com tempo de expiração
            const token = jwt.sign(
                {_id: user._id, admin: user.admin},
                process.env.TOKEN_KEY,
                {expiresIn: '1h'} // Token expira em 1 hora
            );

            // Retorna o token para o cliente
            return res.status(200).json({
                message: 'Usuário logado com sucesso',
                token: token
            });
        } catch (error) {
            return res.status(500).json({
                error: 'Erro Interno do Servidor',
                details: error.message,
                code: 500
            });
        }
    },

    logout: async function (req, res) {
        res.json({success: true});
    },

    // verificação do usuário logado
    getCurrentUser: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) return res.status(401).json({error: "Token não fornecido"});

            const decoded = jwt.verify(token, process.env.TOKEN_KEY);
            const user = await User.findById(decoded._id);

            if (!user) return res.status(404).json({error: "Usuário não encontrado"});

            res.json(user);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    }
};

module.exports = userController;