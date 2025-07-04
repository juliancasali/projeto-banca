import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom"
import {Login} from "./pages/Login"
import {Bancas} from "./pages/Bancas"
import {Home} from "./pages/Home"
import {AuthenticatedLayout} from "./components/AuthenticatedLayout"
import {Professores} from "./pages/Professores"

const ProtectedRoute = ({children}) => {
	const isAuthenticated = !!localStorage.getItem("authToken")

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />
	}

	return children
}

function App() {
	return (
		<Router>
			<Routes>
				<Route path='/login' element={<Login />} />
				<Route
					path='/'
					element={
						<ProtectedRoute>
							<AuthenticatedLayout />
						</ProtectedRoute>
					}
				>
					<Route path='/' element={<Home />} />
					<Route path='bancas' element={<Bancas />} />
					<Route path='professores' element={<Professores />} />
				</Route>
			</Routes>
		</Router>
	)
}

export default App
