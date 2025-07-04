import {useAuth} from "../hooks/useAuth"
import {Button} from "./ui/button"
import {Link, useLocation} from "react-router-dom"
import {LogOut, Users, GraduationCap, Settings} from "lucide-react"
import logo from "../assets/logo_unisinos.png"

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip"

export function Sidebar({collapsed = false}) {
	const {user, logout, isLoggingOut} = useAuth()
	const location = useLocation()

	const navigation = [
		{
			name: "Gerenciar Bancas",
			href: "/",
			icon: Settings,
		},
		{
			name: "Bancas",
			href: "/bancas",
			icon: Users,
		},
		{
			name: "Professores",
			href: "/professores",
			icon: GraduationCap,
		},
	]

	return (
		<div className='h-full flex flex-col bg-white border-r border-border-muted'>
			<div className='p-4 border-b flex border-border-muted items-center transition-all'>
				<img src={logo} alt='TCC Board' className='w-10 h-10' />
			</div>

			<div className='flex-1 overflow-auto py-2'>
				<nav className='space-y-1 px-2'>
					{navigation.map(item => (
						<TooltipProvider key={item.name} delayDuration={0}>
							<Tooltip>
								<TooltipTrigger asChild>
									<Link
										to={item.href}
										className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
											location.pathname === item.href
												? "bg-primary/10 text-primary"
												: "text-muted-foreground hover:bg-accent hover:text-foreground"
										} ${collapsed ? "justify-center" : ""}`}
									>
										<item.icon className='size-5' />
										{!collapsed && item.name}
									</Link>
								</TooltipTrigger>
								{collapsed && (
									<TooltipContent side='right'>{item.name}</TooltipContent>
								)}
							</Tooltip>
						</TooltipProvider>
					))}
				</nav>
			</div>

			<div className='p-4 border-t border-border-muted'>
				<div className='flex flex-col gap-3'>
					{!collapsed ? (
						<>
							<div className='flex items-center gap-2'>
								<div className='size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium'>
									{user?.name?.charAt(0) || "U"}
								</div>
								<div className='flex-1 min-w-0'>
									<p className='text-sm font-medium truncate'>
										{user?.name || "Usuário"}
									</p>
									<p className='text-xs text-muted-foreground truncate'>
										{user?.email}
									</p>
								</div>
							</div>
							<Button
								variant='outline'
								size='sm'
								onClick={logout}
								disabled={isLoggingOut}
								className='w-full justify-start'
							>
								<LogOut className='size-4 mr-2' />
								{isLoggingOut ? "Saindo..." : "Sair"}
							</Button>
						</>
					) : (
						<TooltipProvider delayDuration={0}>
							<Tooltip>
								<TooltipTrigger asChild>
									<div className='flex flex-col items-center gap-2'>
										<div className='size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium'>
											{user?.name?.charAt(0) || "U"}
										</div>
										<Button
											variant='outline'
											size='icon'
											onClick={logout}
											disabled={isLoggingOut}
										>
											<LogOut className='size-4' />
										</Button>
									</div>
								</TooltipTrigger>
								<TooltipContent side='right'>
									{user?.name || "Usuário"}
									<br />
									{isLoggingOut ? "Saindo..." : "Sair"}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
				</div>
			</div>
		</div>
	)
}
