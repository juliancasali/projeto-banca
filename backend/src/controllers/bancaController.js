const Banca = require('../models/Banca');

// Buscar todas as bancas
const getBancas = async (req, res) => {
    try {
        const {termo, status, pagina = 1, itensPorPagina = 10} = req.query;
        const hoje = new Date();

        let query = {}

        if (termo) {
            const regex = new RegExp(termo, 'i');
            query.$or = [
                {titulo: regex},
                {aluno: regex},
                {orientador: regex},
                {curso: regex}
            ];
        }

        if (status) {
            query.status = status;
        }

        const total = await Banca.countDocuments(query);
        const bancas = await Banca.find(query)
            .sort({data: 1})
            .skip((pagina - 1) * itensPorPagina)
            .limit(itensPorPagina);

        res.json({
            itens: bancas,
            paginacao: {
                total,
                totalPaginas: Math.ceil(total / itensPorPagina),
                paginaAtual: Number(pagina),
                itensPorPagina: Number(itensPorPagina)
            }
        });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

// Buscar banca por ID
const getBancaPorId = async (req, res) => {
    try {
        const banca = await Banca.findById(req.params.id).populate('orientador');
        if (!banca) return res.status(404).json({message: "Banca não encontrada"});
        res.json(banca);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

// Criar uma banca
const criarBanca = async (req, res) => {
    try {
        const banca = new Banca(req.body);
        await banca.save();
        res.status(201).json(banca);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

// Atualizar banca
const atualizarBanca = async (req, res) => {
    try {
        const banca = await Banca.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if (!banca) return res.status(404).json({message: "Banca não encontrada"});
        res.json(banca);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

// Remover banca
const removerBanca = async (req, res) => {
    try {
        const banca = await Banca.findByIdAndDelete(req.params.id);
        if (!banca) return res.status(404).json({message: "Banca não encontrada"});
        res.json({success: true});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

const atualizarComposicaoBanca = async (req, res) => {
    try {
        const {bancaId} = req.params;
        let {membros} = req.body;

        // Valida se os membros foram enviados e se são um array
        if (!membros || !Array.isArray(membros)) {
            return res.status(400).json({error: 'O campo "membros" deve ser um array.'});
        }

        // Atualiza o campo 'membros' da banca
        const updatedBanca = await Banca.findByIdAndUpdate(
            bancaId,
            {membros},
            {new: true, runValidators: true}
        );

        if (!updatedBanca) {
            return res.status(404).json({error: 'Banca não encontrada.'});
        }

        return res.status(200).json(updatedBanca);
    } catch (error) {
        console.error("Erro ao atualizar composição da banca:", error);
        return res.status(500).json({error: "Falha ao atualizar membros. Tente novamente."});
    }
}

module.exports = {getBancas, getBancaPorId, criarBanca, atualizarBanca, removerBanca, atualizarComposicaoBanca};