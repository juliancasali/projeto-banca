import {useMutation, useQueryClient} from "@tanstack/react-query"
import {useNavigate} from "react-router-dom"
import authService from "../services/authService"

export function useAuth() {
	const queryClient = useQueryClient()
	const navigate = useNavigate()

	// Mutation para login
	const loginMutation = useMutation({
		mutationFn: credentials => authService.login(credentials),
		onSuccess: data => {
			authService.setAuthData(data.user, data.token)
			queryClient.invalidateQueries({queryKey: ["user"]})

			navigate("/")
		},
	})

	// Mutation para logout
	const logoutMutation = useMutation({
		mutationFn: () => authService.logout(),
		onSuccess: () => {
			queryClient.clear()
			navigate("/login")
		},
	})

	return {
		login: loginMutation.mutate,
		logout: logoutMutation.mutate,
		isLoggingIn: loginMutation.isPending,
		isLoggingOut: logoutMutation.isPending,
		loginError: loginMutation.error,
		user: authService.getCurrentUser(),
		isAuthenticated: !!authService.getCurrentUser(),
	}
}
