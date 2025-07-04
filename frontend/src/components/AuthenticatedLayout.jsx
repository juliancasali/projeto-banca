import {Sidebar} from "./Sidebar"
import {Outlet} from "react-router-dom"
import {useAuth} from "../hooks/useAuth"
import {Button} from "./ui/button"
import {Menu, ChevronLeft, ChevronRight} from "lucide-react"
import {useState} from "react"
import {Dialog, DialogContent} from "./ui/dialog"
import logo from "../assets/logo_unisinos.png"

export function AuthenticatedLayout() {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

	const toggleSidebar = () => {
		setSidebarCollapsed(!sidebarCollapsed)
	}

	return (
		<div className="flex h-screen overflow-hidden bg-gray-50">
			<div className={`hidden md:flex md:flex-col relative transition-all duration-300 ${
				sidebarCollapsed ? "md:w-20" : "md:w-64"
			}`}>
				<Sidebar collapsed={sidebarCollapsed} />
				<Button
					variant="ghost"
					size="icon"
					className="absolute top-6 !bg-white border-border-muted -right-3 size-6 rounded-full border hidden md:flex"
					onClick={toggleSidebar}
					aria-label={sidebarCollapsed ? "Expandir menu" : "Minimizar menu"}
				>
					{sidebarCollapsed ? (
						<ChevronRight className="size-4" />
					) : (
						<ChevronLeft className="size-4" />
					)}
				</Button>
			</div>

			<div className="flex flex-1 flex-col overflow-hidden">
				<div className="md:hidden border-b p-4 border-border-muted bg-white">
					<MobileHeader />
				</div>
				
				<main className="flex-1 overflow-y-auto p-4 md:p-8">
					<Outlet />
				</main>
			</div>
		</div>
	)
}

function MobileHeader() {
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const {user} = useAuth()

	return (
		<>
			<div className="flex items-center justify-between">
				<Button 
					variant="ghost" 
					size="icon" 
					onClick={() => setSidebarOpen(true)}
				>
					<Menu className="size-5" />
				</Button>
				<img src={logo} alt='TCC Board' className='w-10 h-10' />
				<div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
					{user?.name?.charAt(0) || "U"}
				</div>
			</div>

			<Dialog open={sidebarOpen} onOpenChange={setSidebarOpen}>
				<DialogContent side="left" className="p-0 sm:max-w-sm">
					<div className="h-full">
						<Sidebar />
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
} 