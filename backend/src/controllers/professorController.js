const Professor = require('../models/Professor');
const {Types} = require("mongoose");

// Buscar todos os professores
const getProfessores = async (req, res) => {
    try {
        const {termo, pagina = 1, itensPorPagina = 10} = req.query;
        let query = {};

        if (termo) {
            const regex = new RegExp(termo, "i");
            query.$or = [
                {nome: regex},
                {email: regex},
                {departamento: regex},
                {especialidades: {$in: [regex]}},
            ];
        }

        const total = await Professor.countDocuments(query);
        const professores = await Professor.find(query)
            .skip((pagina - 1) * itensPorPagina)
            .limit(Number(itensPorPagina));

        res.json({
            itens: professores,
            paginacao: {
                total,
                totalPaginas: Math.ceil(total / itensPorPagina),
                paginaAtual: Number(pagina),
                itensPorPagina: Number(itensPorPagina),
            },
        });
    } catch (error) {
        console.error("Erro ao buscar professores:", error);
        res.status(500).json({error: error.message});
    }
};

// Buscar professor por ID
const getProfessorPorId = async (req, res) => {
    try {
        const professor = await Professor.findById(req.params.id);
        if (!professor) return res.status(404).json({message: "Professor não encontrado"});
        res.json(professor);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

// Criar um professor
const criarProfessor = async (req, res) => {
    try {
        const professor = new Professor(req.body);
        await professor.save();
        res.status(201).json(professor);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

// Atualizar professor
const atualizarProfessor = async (req, res) => {
    try {
        const professor = await Professor.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if (!professor) return res.status(404).json({message: "Professor não encontrado"});
        res.json(professor);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

// Remover professor
const removerProfessor = async (req, res) => {
    try {
        const {id} = req.params;

        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido." });
        }
        const professor = await Professor.findByIdAndDelete(id);
        if (!professor) return res.status(404).json({message: "Professor não encontrado"});
        res.json({success: true});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

module.exports = {getProfessores, getProfessorPorId, criarProfessor, atualizarProfessor, removerProfessor};