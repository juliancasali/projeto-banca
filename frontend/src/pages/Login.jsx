import {useState} from "react"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card"
import {Input} from "../components/ui/input"
import {Button} from "../components/ui/button"
import {Label} from "../components/ui/label"
import {useAuth} from "../hooks/useAuth"
import logo from "../assets/logo_unisinos.png"

export function Login() {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const {login, isLoggingIn, loginError} = useAuth()

	const handleSubmit = async e => {
		e.preventDefault()
		login({email, password})
	}

	return (
		<div className='min-h-screen flex items-center justify-center p-4 bg-background'>
			<Card className='w-full max-w-[400px] mx-auto'>
				<CardHeader className='space-y-2'>
					<CardTitle className='text-xl sm:text-2xl text-center flex flex-col justify-center items-center'>
						<img src={logo} alt='Unisinos' className='w-10 h-10' />

						<span className='text-primary'>Banca Fácil</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className='space-y-5'>
						<div className='space-y-2'>
							<Label htmlFor='email' className='text-sm sm:text-base'>
								Email
							</Label>
							<Input
								id='email'
								type='email'
								value={email}
								onChange={e => setEmail(e.target.value)}
								required
								className='h-10 sm:h-11 text-base'
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='password' className='text-sm sm:text-base'>
								Senha
							</Label>
							<Input
								id='password'
								type='password'
								value={password}
								onChange={e => setPassword(e.target.value)}
								required
								className='h-10 sm:h-11 text-base'
							/>
						</div>
						{loginError && (
							<div className='text-destructive text-sm px-1'>
								{loginError.message ||
									"Erro ao fazer login. Verifique suas credenciais."}
							</div>
						)}
						<Button
							type='submit'
							className='w-full h-11 text-base mt-2'
							disabled={isLoggingIn}
						>
							{isLoggingIn ? "Entrando..." : "Entrar"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
