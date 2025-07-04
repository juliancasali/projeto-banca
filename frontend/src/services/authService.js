import api from './api.js';

const authService = {

	login: async credentials => {
		try{
			const response = await api.post('/auth/login', credentials);
			return response.data;
		}catch (error) {
			console.error("Erro no login:", error);
			throw error.response?.data || "Erro desconhecido";
		}

	},

	logout: async () => {
		await api.post('/auth/logout');

		// Limpando dados locais
		localStorage.removeItem("authToken")
		localStorage.removeItem("userData")
	},

	getCurrentUser: () => {
		const userData = localStorage.getItem("userData");
		if (!userData || userData === "undefined") {
			return null;
		}
		try {
			return JSON.parse(userData);
		} catch (error) {
			console.error("Erro ao parsear userData:", error);
			return null;
		}
	},

	setAuthData: (userData, token) => {
		if (userData !== undefined && userData !== null) {
			localStorage.setItem("userData", JSON.stringify(userData))
		}
		localStorage.setItem("authToken", token)
	},


}

export default authService
