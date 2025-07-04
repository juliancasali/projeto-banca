require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const  seedAdmins = async() => {
    try {
        const totalAdmins = parseInt(process.env.ADMINS, 10) || 0;

        for (let i = 1; i <= totalAdmins; i++) {
            const nome = process.env[`ADMIN_${i}_NAME`];
            const email = process.env[`ADMIN_${i}_EMAIL`]?.trim().toLowerCase();
            const password = process.env[`ADMIN_${i}_PASSWORD`];

            if (!email || !password || !name) {
                console.warn(`Admin ${i}: dados incompletos`);
                continue;
            }

            const exists = await User.findOne({email});

            if (exists) {
                console.log(`Admin '${email}' já existe`);
                continue;
            }

            const hashed = await bcrypt.hash(password, 10);
            await User.create({
                nome: nome,
                email,
                password: hashed,
                role: 'admin'
            });

            console.log(`Admin '${email}' criado com sucesso!`);
        }
    } catch (err) {
        console.error('Erro ao criar admins:', err.message);
        process.exit(1);
    }
}

module.exports = seedAdmins;
