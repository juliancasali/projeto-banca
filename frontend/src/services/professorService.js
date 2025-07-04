import api from "@/services/api.js";

const professorService = {

	getProfessores: async (filtros = {}, pagina = 1, itensPorPagina = 10) => {
		try {
			const response = await api.get("/professores", {
				params: {
					...filtros,
					pagina,
					itensPorPagina,
				},
			});
			return response.data;
		} catch (error) {
			console.error("Erro ao buscar professores:", error);
			throw new Error("Não foi possível carregar os professores.");
		}
	},

	getProfessorPorId: async id => {
		try {
			const response = await api.get(`/professores/${id}`);
			return response.data;
		} catch (error) {
			console.error("Erro ao buscar o professor:", error);
			throw new Error("Professor não encontrado");
		}
	},

	criarProfessor: async professor => {
		try {
			const response = await api.post("/professores/create", professor);
			return response.data;
		} catch (error) {
			console.error("Erro ao criar professor:", error);
			throw new Error("Falha ao criar professor. Tente novamente.");
		}
	},

	atualizarProfessor: async (id, professor) => {
		try {
			const response = await api.put(`/professores/${id}`, professor);
			return response.data;
		} catch (error) {
			console.error("Erro ao atualizar professor:", error);
			throw new Error("Falha ao atualizar professor. Tente novamente.");
		}
	},

	removerProfessor: async id => {
		try {
			const response = await api.delete(`/professores/${id}`);
			return response.data;
		} catch (error) {
			console.error("Erro ao remover professor:", error);
			throw new Error("Falha ao remover professor. Tente novamente.");
		}
	},
}

export default professorService
