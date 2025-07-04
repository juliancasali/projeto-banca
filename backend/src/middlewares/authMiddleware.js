const jwt = require("jsonwebtoken");

const authMiddleware = {
    auth: function (req, res, next) {
        const token = req.headers.authorization?.split(" ")[1];

        // Verifica se o token foi fornecido
        if (!token) {
            return res.status(401).json({
                error: 'Acesso Negado: Nenhum token fornecido',
                code: 401
            });
        }

        try {
            // Verifica e decodifica o token usando a chave secreta
            const decoded = jwt.verify(token, process.env.TOKEN_KEY);
            req.user = decoded;
            next()
        } catch (error) {
            // Trata diferentes tipos de erros relacionados ao token
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    error: 'Acesso Negado: O token expirou',
                    code: 401
                });
            } else if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    error: 'Acesso Negado: Token inválido',
                    code: 401
                });
            } else {
                return res.status(500).json({
                    error: 'Erro no servidor: Não foi possível processar o token.',
                    code: 500
                });
            }
        }
    }
}
module.exports = authMiddleware.auth;