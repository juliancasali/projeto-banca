const express = require('express');
const router = express.Router();
const bancaController = require('../controllers/bancaController')

const app = express();

router.get('/', bancaController.getBancas);
router.get('/:id', bancaController.getBancaPorId);
router.post('/create', bancaController.criarBanca);
router.put('/:id', bancaController.atualizarBanca);
router.delete('/:id', bancaController.removerBanca);
router.put('/:bancaId/membros', bancaController.atualizarComposicaoBanca)

module.exports = router;