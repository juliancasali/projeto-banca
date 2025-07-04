import api from "@/services/api.js";

const bancaService = {

	getBancas: async (filtros = {}, pagina = 1, itensPorPagina = 5) => {
		try {
			const response = await api.get("/bancas", {
				params: {
					...filtros,
					pagina,
					itensPorPagina
				}
			});
			return response.data;
		} catch (error) {
			console.error("Erro ao buscar bancas:", error);
			throw new Error("Não foi possível carregar as bancas.");
		}

	},

	getBancaPorId: async id => {
		try {
			const response = await api.get(`/bancas/${id}`);
			return response.data;
		} catch (error) {
			console.error("Erro ao buscar banca:", error);
			throw new Error("Banca não encontrada");
		}
	},

	criarBanca: async banca => {
		try {
			const response = await api.post("/bancas/create", banca)
			return response.data;
		} catch (error) {
			console.error("Erro a criar a banca: ", error.response.data || error);
			throw new Error("Falha a criar a banca, tente novamente.")
		}
	},

	atualizarBanca: async (id, banca) => {
		try {
			const response = await api.put(`/bancas/${id}`, banca)
			return response.data;
		} catch (error) {
			console.error("Erro a atualizar a banca", error)
			throw new Error("Falha a atualizar a banca, tente novamente.")
		}
	},

	removerBanca: async id => {
		try {
			const response = await api.delete(`/bancas/${id}`)
			return response.data;
		} catch (error) {
			console.error("Erro ao remover banca:", error);
			throw new Error("Falha ao remover banca. Tente novamente.");
		}
	},

	atualizarComposicaoBanca: async (bancaId, membros) => {
		try {
			const response = await api.put(`/bancas/${bancaId}/membros`, {membros});
			return response.data;
		} catch (error) {
			console.error("Erro ao atualizar composição da banca:", error);
			throw new Error("Falha ao atualizar membros. Tente novamente.");
		}
	},
}

export default bancaService
