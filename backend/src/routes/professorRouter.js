const express = require('express');
const router = express.Router();
const professorController = require('../controllers/professorController')

router.get('/', professorController.getProfessores);
router.get('/:id', professorController.getProfessorPorId);
router.post('/create', professorController.criarProfessor);
router.put('/:id', professorController.atualizarProfessor);
router.delete('/:id', professorController.removerProfessor);

module.exports = router;