import {useState, useMemo, useCallback} from "react"
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query"
import {format} from "date-fns"
import {ptBR} from "date-fns/locale"
import {
	Calendar,
	Users,
	Search,
	CheckCircle2,
	AlertCircle,
	X,
	Download,
} from "lucide-react"

import bancaService from "../services/bancaService"
import professorService from "../services/professorService"
import {Card, CardContent, CardHeader, CardTitle} from "../components/ui/card"
import {Button} from "../components/ui/button"
import {Input} from "../components/ui/input"
import {Badge} from "../components/ui/badge"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../components/ui/dialog"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../components/ui/tabs"
import {Label} from "../components/ui/label"
import {Checkbox} from "../components/ui/checkbox"
import {ScrollArea} from "../components/ui/scroll-area"
import {Pagination} from "../components/ui/pagination"
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
} from "../components/ui/alert-dialog"

export function Home() {
	const queryClient = useQueryClient()
	const [filtros, setFiltros] = useState({
		termo: "",
		status: "agendada",
	})
	const [termoBusca, setTermoBusca] = useState("")

	const [dialogComposicaoAberto, setDialogComposicaoAberto] = useState(false)
	const [bancaSelecionada, setBancaSelecionada] = useState(null)
	const [professoresSelecionados, setProfessoresSelecionados] = useState([])
	const [filtroProfessores, setFiltroProfessores] = useState("")
	const [tabAtual, setTabAtual] = useState("sugeridos")
	const [dataConflito, setDataConflito] = useState(null)

	const [paginaAtual, setPaginaAtual] = useState(1)
	const [itensPorPagina] = useState(5)

	// Consulta para buscar bancas
	const {
		data: bancasData,
		isLoading: isLoadingBancas,
		isError: isErrorBancas,
	} = useQuery({
		queryKey: ["bancas", filtros, paginaAtual, itensPorPagina],
		queryFn: () => bancaService.getBancas(filtros, paginaAtual, itensPorPagina),
	})

	const bancas = useMemo(() => bancasData?.itens || [], [bancasData])
	const paginacao = bancasData?.paginacao || {totalPaginas: 1, paginaAtual: 1}

	// Consulta para buscar todos os professores (para diálogo de composição)
	const {data: professoresData, isLoading: isLoadingProfessores} = useQuery({
		queryKey: ["professores", {termo: filtroProfessores, disponivel: true}],
		queryFn: () =>
			professorService.getProfessores(
				{
					termo: filtroProfessores,
					disponivel: true,
				},
				1,
				100
			),
		enabled: dialogComposicaoAberto,
	})

	const professores = professoresData?.itens || []

	// Mutation para atualizar a composição da banca
	const atualizarComposicaoMutation = useMutation({
		mutationFn: ({bancaId, membros}) =>
			bancaService.atualizarComposicaoBanca(bancaId, membros),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ["bancas"]})
			fecharDialogComposicao()
		},
	})

	// Buscar todas as bancas para construir o mapa de professores com bancas
	const {data: todasBancas} = useQuery({
		queryKey: ["bancas", "todas"],
		queryFn: () => bancaService.getBancas({status: ""}, 1, 1000),
		staleTime: 5 * 60 * 1000, // 5 minutos
	})

	// Adicionar uma mutation para buscar todas as bancas para exportação
	const exportarTodasBancasMutation = useMutation({
		mutationFn: () => bancaService.getBancas(filtros, 1, 10000), // Buscar todas as bancas com os filtros atuais
		onSuccess: (data) => {
			const todasBancas = data?.itens || []
			gerarArquivoCSV(todasBancas)
		},
	})

	const formatarData = dataString => {
		if (!dataString) return ""
		const data = new Date(dataString)
		return format(data, "dd/MM/yyyy 'às' HH:mm", {locale: ptBR})
	}

	const verificarConflito = useCallback((data1, data2) => {
		if (!data1 || !data2) return false

		const dataInicio1 = new Date(data1)
		const dataInicio2 = new Date(data2)

		// Verificar se as bancas são no mesmo dia
		const mesmodia = dataInicio1.toDateString() === dataInicio2.toDateString()
		if (!mesmodia) return false // Se não for no mesmo dia, não há conflito

		// Calcular a diferença de tempo em horas
		const diferencaEmMs = Math.abs(
			dataInicio1.getTime() - dataInicio2.getTime()
		)
		const diferencaEmHoras = diferencaEmMs / (1000 * 60 * 60)

		// Conflito se bancas estiverem a menos de 2 horas de distância
		return diferencaEmHoras < 2
	}, [])

	const professoresComBancas = useMemo(() => {
		if (!todasBancas?.itens) return []

		const mapa = {}

		todasBancas.itens.forEach(banca => {
			if (banca.membros && banca.membros.length > 0) {
				banca.membros.forEach(membro => {
					if (!mapa[membro.id]) {
						mapa[membro.id] = {
							id: membro.id,
							nome: membro.nome,
							bancas: [],
						}
					}

					mapa[membro.id].bancas.push({
						id: banca.id,
						titulo: banca.titulo,
						data: banca.data,
					})
				})
			}
		})

		// Converter o mapa em array
		return Object.values(mapa)
	}, [todasBancas])

	// Função para verificar conflitos nas bancas da página inicial
	const verificarConflitosEntreBancas = useMemo(() => {
		// Se não temos todas as bancas carregadas, não podemos verificar conflitos
		if (!todasBancas?.itens) return new Map()

		const conflitos = new Map()
		const bancasTodas = todasBancas.itens

		// Para cada banca
		for (let i = 0; i < bancas.length; i++) {
			const banca1 = bancas[i]

			// Se a banca não tem membros, não pode ter conflitos
			if (!banca1.membros || banca1.membros.length === 0) {
				continue
			}

			// Comparar com todas as outras bancas
			for (let j = 0; j < bancasTodas.length; j++) {
				// Não comparar com ela mesma
				if (bancasTodas[j].id === banca1.id) continue

				const banca2 = bancasTodas[j]

				// Se a outra banca não tem membros, não pode ter conflitos
				if (!banca2.membros || banca2.membros.length === 0) {
					continue
				}

				// Verificar se as datas conflitam
				const temConflitoDatas = verificarConflito(
					new Date(banca1.data),
					new Date(banca2.data)
				)

				// Se as datas não conflitam, pular
				if (!temConflitoDatas) continue

				// Verificar se há membros em comum
				const membrosComuns = banca1.membros.some(membro1 =>
					banca2.membros.some(membro2 => membro1.id === membro2.id)
				)

				// Se há membros em comum, marcar conflito
				if (membrosComuns) {
					conflitos.set(banca1.id, true)
					break // Já encontrou conflito, pode parar
				}
			}
		}

		return conflitos
	}, [todasBancas, bancas, verificarConflito])

	const verificarConflitoProfessor = professor => {
		if (!bancaSelecionada) return false

		const dataBanca = new Date(bancaSelecionada.data)
		const professorComBancas = professoresComBancas.find(
			p => p.id === professor.id
		)

		if (!professorComBancas) return false

		return professorComBancas.bancas.some(b => {
			if (b.id === bancaSelecionada.id) return false // Mesma banca, não é conflito

			const outraData = new Date(b.data)

			// Usar a função verificarConflito existente para verificar sobreposição
			return verificarConflito(dataBanca, outraData)
		})
	}

	const getProfessoresSugeridos = () => {
		if (!bancaSelecionada || !professores.length) return []

		const tags = bancaSelecionada.tags || []

		return professores.filter(professor => {
			const especialidades = professor.especialidades || []

			return tags.some(tag =>
				especialidades.some(
					esp =>
						esp.toLowerCase().includes(tag.toLowerCase()) ||
						tag.toLowerCase().includes(esp.toLowerCase())
				)
			)
		})
	}

	const getProfessoresComConflito = () => {
		if (!bancaSelecionada || !professores.length) return []

		return professores.filter(professor => {
			const professorComBancas = professoresComBancas.find(
				p => p.id === professor.id
			)
			if (!professorComBancas) return false

			const dataBancaSelecionada = new Date(bancaSelecionada.data)

			return professorComBancas.bancas.some(b => {
				if (b.id === bancaSelecionada.id) return false // Mesma banca

				const outraData = new Date(b.data)
				return verificarConflito(dataBancaSelecionada, outraData)
			})
		})
	}

	const abrirDialogComposicao = banca => {
		setBancaSelecionada(banca)
		setProfessoresSelecionados(banca.membros || [])
		setDialogComposicaoAberto(true)
	}

	const fecharDialogComposicao = () => {
		setDialogComposicaoAberto(false)
		setBancaSelecionada(null)
		setProfessoresSelecionados([])
		setFiltroProfessores("")
	}

	const toggleProfessorSelecionado = professor => {
		if (professoresSelecionados.some(p => p.id === professor.id)) {
			setProfessoresSelecionados(prev =>
				prev.filter(p => p.id !== professor.id)
			)
		} else {
			setProfessoresSelecionados(prev => [...prev, professor])

			const temConflito = verificarConflitoProfessor(professor)

			if (temConflito) {
				setDataConflito(professor)
			}
		}
	}

	const salvarComposicao = () => {
		if (!bancaSelecionada) return

		atualizarComposicaoMutation.mutate({
			bancaId: bancaSelecionada.id,
			membros: professoresSelecionados,
		})
	}

	const handlePageChange = newPage => {
		setPaginaAtual(newPage)
		window.scrollTo({top: 0, behavior: "smooth"})
	}

	const handleSubmitBusca = e => {
		e.preventDefault()
		setFiltros(prev => ({...prev, termo: termoBusca}))
	}

	const renderizarStatus = status => {
		switch (status) {
			case "agendada":
				return (
					<Badge
						variant='outline'
						className='bg-blue-50 text-blue-600 border-blue-200'
					>
						Agendada
					</Badge>
				)
			case "concluida":
				return (
					<Badge
						variant='outline'
						className='bg-green-50 text-green-600 border-green-200'
					>
						Concluída
					</Badge>
				)
			default:
				return <Badge variant='outline'>{status}</Badge>
		}
	}

	const professoresSugeridos = getProfessoresSugeridos()
	const professoresComConflito = getProfessoresComConflito()

	const gerarArquivoCSV = (bancasParaExportar) => {
		if (!bancasParaExportar || bancasParaExportar.length === 0) {
			return
		}

		const headers = [
			'ID',
			'Título',
			'Aluno',
			'Orientador', 
			'Curso',
			'Status',
			'Data',
			'Tags',
			'Membros da Banca'
		]

		const csvData = bancasParaExportar.map(banca => {
			const membros = banca.membros && banca.membros.length > 0 
				? banca.membros.map(m => m.nome).join('; ')
				: 'Nenhum membro'
			
			const tags = banca.tags && banca.tags.length > 0
				? banca.tags.join('; ')
				: ''

			return [
				banca.id,
				`"${banca.titulo}"`,
				`"${banca.aluno}"`,
				`"${banca.orientador}"`,
				`"${banca.curso}"`,
				banca.status,
				formatarData(banca.data),
				`"${tags}"`,
				`"${membros}"`
			]
		})

		const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))]
			.join('\n')

		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
		const link = document.createElement('a')
		
		if (link.download !== undefined) {
			const url = URL.createObjectURL(blob)
			link.setAttribute('href', url)
			link.setAttribute('download', `bancas_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`)
			link.style.visibility = 'hidden'
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
		}
	}

	const exportarParaCSV = () => {
		exportarTodasBancasMutation.mutate()
	}

	return (
		<div className='space-y-6'>
			<div className='mb-6'>
				<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
					<h2 className='text-2xl font-semibold'>Gerenciamento de Bancas</h2>
					<Button 
						onClick={exportarParaCSV}
						variant="outline"
						className="flex items-center gap-2"
						disabled={exportarTodasBancasMutation.isPending}
					>
						<Download className="h-4 w-4" />
						{exportarTodasBancasMutation.isPending ? 'Exportando...' : 'Exportar CSV'}
					</Button>
				</div>
			</div>

			<Card className='mb-6'>
				<CardHeader className='pb-3'>
					<CardTitle className='text-lg font-medium'>Buscar</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='flex flex-col sm:flex-row gap-4 mb-4'>
						<form
							onSubmit={handleSubmitBusca}
							className='flex space-x-2 flex-1'
						>
							<div className='relative flex-1'>
								<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
								<Input
									type='search'
									placeholder='Buscar banca, aluno, orientador...'
									className='pl-8'
									value={termoBusca}
									onChange={e => setTermoBusca(e.target.value)}
								/>
							</div>
							<Button type='submit'>Buscar</Button>
						</form>

						<div className='flex gap-2 items-center'>
							<Label htmlFor='status-filter' className='whitespace-nowrap'>
								Status:
							</Label>
							<Select
								value={filtros.status || "todos"}
								onValueChange={value =>
									setFiltros(prev => ({
										...prev,
										status: value === "todos" ? "" : value,
									}))
								}
							>
								<SelectTrigger id='status-filter' className='w-[140px]'>
									<SelectValue placeholder='Todos' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='todos'>Todos</SelectItem>
									<SelectItem value='agendada'>Agendadas</SelectItem>
									<SelectItem value='concluida'>Concluídas</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{isLoadingBancas ? (
				<div className='p-8 text-center'>
					<div className='mb-2 text-lg'>Carregando bancas...</div>
					<div className='animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full'></div>
				</div>
			) : isErrorBancas ? (
				<div className='p-8 text-center'>
					<div className='text-destructive mb-2'>Erro ao carregar bancas</div>
					<Button
						onClick={() =>
							queryClient.invalidateQueries({queryKey: ["bancas"]})
						}
					>
						Tentar novamente
					</Button>
				</div>
			) : bancas.length === 0 ? (
				<div className='text-center py-6 text-muted-foreground'>
					Nenhuma banca encontrada com os filtros selecionados.
				</div>
			) : (
				<>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						{bancas.map(banca => {
							const temConflito =
								verificarConflitosEntreBancas.get(banca.id) || false

							return (
								<Card
									key={banca.id}
									className={`mb-4 ${temConflito ? "border-red-300" : ""}`}
								>
									<CardHeader>
										<div className='flex justify-between items-start'>
											<CardTitle className='text-lg font-medium'>
												{banca.titulo}
												{temConflito && (
													<Badge
														variant='outline'
														className='ml-2 bg-red-50 text-red-600 border-red-200'
													>
														Conflito de Horário
													</Badge>
												)}
											</CardTitle>
										</div>
									</CardHeader>
									<CardContent className='space-y-4'>
										<div className='grid grid-cols-2 gap-3'>
											<div>
												<p className='text-xs text-muted-foreground mb-1'>
													Aluno
												</p>
												<p className='font-medium'>{banca.aluno}</p>
											</div>
											<div>
												<p className='text-xs text-muted-foreground mb-1'>
													Orientador
												</p>
												<p className='font-medium'>{banca.orientador}</p>
											</div>
											<div>
												<p className='text-xs text-muted-foreground mb-1'>
													Curso
												</p>
												<p className='font-medium'>{banca.curso}</p>
											</div>
											<div>
												<p className='text-xs text-muted-foreground mb-1'>
													Status
												</p>
												<div>{renderizarStatus(banca.status)}</div>
											</div>
										</div>

										<div className='flex items-center gap-1'>
											<Calendar className='h-4 w-4 text-muted-foreground' />
											<span className='text-sm'>
												{formatarData(banca.data)}
											</span>
										</div>

										{banca.tags && banca.tags.length > 0 && (
											<div className='flex flex-wrap gap-1'>
												{banca.tags.map(tag => (
													<Badge key={tag} className='text-xs'>
														{tag}
													</Badge>
												))}
											</div>
										)}

										<div>
											<p className='text-xs text-muted-foreground mb-2 flex items-center gap-1'>
												<Users className='h-3 w-3' /> Membros da Banca
											</p>

											{banca.membros && banca.membros.length > 0 ? (
												<div className='space-y-2'>
													{banca.membros.map(membro => (
														<div
															key={membro.id}
															className='text-sm flex items-center gap-2'
														>
															<div className='bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center font-medium text-xs'>
																{membro.nome.charAt(0)}
															</div>
															<span>{membro.nome}</span>
														</div>
													))}
												</div>
											) : (
												<p className='text-sm text-muted-foreground'>
													Nenhum membro adicionado
												</p>
											)}

											<Button
												size='sm'
												className='mt-4'
												onClick={() => abrirDialogComposicao(banca)}
											>
												<Users className='h-4 w-4' />
												Compor Banca
											</Button>
										</div>
									</CardContent>
								</Card>
							)
						})}
					</div>

					{bancas.length > 0 && (
						<Pagination
							currentPage={paginacao.paginaAtual}
							totalPages={paginacao.totalPaginas}
							onPageChange={handlePageChange}
						/>
					)}
				</>
			)}

			{/* Diálogo de Composição da Banca */}
			<Dialog
				open={dialogComposicaoAberto}
				onOpenChange={setDialogComposicaoAberto}
			>
				<DialogContent className='max-w-3xl'>
					<DialogHeader>
						<DialogTitle>Composição da Banca</DialogTitle>
						<DialogDescription>
							{bancaSelecionada && (
								<div className='mt-2'>
									<div className='font-medium'>{bancaSelecionada.titulo}</div>
									<div className='flex items-center gap-1 text-sm text-muted-foreground'>
										<Calendar className='h-3 w-3' />
										<span>{formatarData(bancaSelecionada.data)}</span>
									</div>
								</div>
							)}
						</DialogDescription>
					</DialogHeader>

					<div className='space-y-4 mt-4'>
						<div>
							<h4 className='text-sm font-medium mb-2'>
								Membros Selecionados ({professoresSelecionados.length})
							</h4>
							<div className='rounded-md p-2 min-h-16 bg-white'>
								{professoresSelecionados.length === 0 ? (
									<div className='text-sm text-muted-foreground p-2'>
										Nenhum professor selecionado
									</div>
								) : (
									<div className='flex flex-wrap gap-2'>
										{professoresSelecionados.map(professor => (
											<Badge
												key={professor.id}
												className='flex items-center gap-1'
											>
												{professor.nome}
												<Button
													variant='ghost'
													size='icon'
													className='h-4 w-4 p-0 ml-1 hover:bg-transparent'
													onClick={() => toggleProfessorSelecionado(professor)}
												>
													<X className='h-3 w-3' />
												</Button>
											</Badge>
										))}
									</div>
								)}
							</div>
						</div>

						<div>
							<div className='relative mb-2'>
								<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
								<Input
									placeholder='Buscar professores...'
									className='pl-8'
									value={filtroProfessores}
									onChange={e => setFiltroProfessores(e.target.value)}
								/>
							</div>

							<Tabs value={tabAtual} onValueChange={setTabAtual}>
								<TabsList className='mb-2'>
									<TabsTrigger
										value='sugeridos'
										className='flex items-center gap-1'
									>
										<CheckCircle2 className='h-3.5 w-3.5' />
										Sugeridos ({professoresSugeridos.length})
									</TabsTrigger>
									<TabsTrigger
										value='todos'
										className='flex items-center gap-1'
									>
										<Users className='h-3.5 w-3.5' />
										Todos ({professores.length})
									</TabsTrigger>
									<TabsTrigger
										value='conflitos'
										className='flex items-center gap-1'
									>
										<AlertCircle className='h-3.5 w-3.5' />
										Conflitos ({professoresComConflito.length})
									</TabsTrigger>
								</TabsList>

								<div className='border border-border-muted rounded-md overflow-hidden bg-white'>
									<ScrollArea className='h-[300px]'>
										<TabsContent value='sugeridos' className='m-0'>
											{isLoadingProfessores ? (
												<div className='p-4 text-center'>
													<div className='animate-spin mx-auto w-5 h-5 border-2 border-primary border-t-transparent rounded-full'></div>
												</div>
											) : professoresSugeridos.length === 0 ? (
												<div className='p-4 text-center text-muted-foreground'>
													Nenhum professor sugerido encontrado
												</div>
											) : (
												<div className='divide-y divide-border-muted'>
													{professoresSugeridos.map(professor => (
														<ProfessorItem
															key={professor.id}
															professor={professor}
															isSelected={professoresSelecionados.some(
																p => p.id === professor.id
															)}
															hasConflict={professoresComConflito.some(
																p => p.id === professor.id
															)}
															onToggle={() =>
																toggleProfessorSelecionado(professor)
															}
														/>
													))}
												</div>
											)}
										</TabsContent>

										<TabsContent value='todos' className='m-0'>
											{isLoadingProfessores ? (
												<div className='p-4 text-center'>
													<div className='animate-spin mx-auto w-5 h-5 border-2 border-primary border-t-transparent rounded-full'></div>
												</div>
											) : professores.length === 0 ? (
												<div className='p-4 text-center text-muted-foreground'>
													Nenhum professor encontrado
												</div>
											) : (
												<div className='divide-y divide-border-muted'>
													{professores.map(professor => (
														<ProfessorItem
															key={professor.id}
															professor={professor}
															isSelected={professoresSelecionados.some(
																p => p.id === professor.id
															)}
															hasConflict={professoresComConflito.some(
																p => p.id === professor.id
															)}
															onToggle={() =>
																toggleProfessorSelecionado(professor)
															}
														/>
													))}
												</div>
											)}
										</TabsContent>

										<TabsContent value='conflitos' className='m-0'>
											{isLoadingProfessores ? (
												<div className='p-4 text-center'>
													<div className='animate-spin mx-auto w-5 h-5 border-2 border-primary border-t-transparent rounded-full'></div>
												</div>
											) : professoresComConflito.length === 0 ? (
												<div className='p-4 text-center text-muted-foreground'>
													Nenhum professor com conflito de horário
												</div>
											) : (
												<div className='divide-y divide-border-muted'>
													{professoresComConflito.map(professor => (
														<ProfessorItem
															key={professor.id}
															professor={professor}
															isSelected={professoresSelecionados.some(
																p => p.id === professor.id
															)}
															hasConflict={true}
															onToggle={() =>
																toggleProfessorSelecionado(professor)
															}
														/>
													))}
												</div>
											)}
										</TabsContent>
									</ScrollArea>
								</div>
							</Tabs>
						</div>
					</div>

					<DialogFooter className='pt-4'>
						<Button variant='outline' onClick={fecharDialogComposicao}>
							Cancelar
						</Button>
						<Button onClick={salvarComposicao}>Salvar Composição</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			{/* Dialog de Atenção */}
			<AlertDialog
				open={dataConflito !== null}
				onOpenChange={() => setDataConflito(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className='flex items-center gap-2'>
							<AlertCircle className='h-5 w-5 text-destructive' />
							Atenção
						</AlertDialogTitle>
						<AlertDialogDescription>
							{dataConflito?.nome} tem conflito de horário com outra banca
							agendada no mesmo período.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogAction
							onClick={() => setDataConflito(null)}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
						>
							Ok
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}

function ProfessorItem({professor, isSelected, hasConflict, onToggle}) {
	return (
		<div className='p-3 flex items-center justify-between'>
			<div className='flex items-center gap-3'>
				<Checkbox checked={isSelected} onCheckedChange={onToggle} />

				<div>
					<div className='font-medium flex items-center gap-2'>
						{professor.nome}
						{hasConflict && (
							<Badge
								variant='outline'
								className='bg-red-50 text-red-600 border-red-200 text-xs'
							>
								Conflito de Horário
							</Badge>
						)}
					</div>

					{hasConflict && (
						<div className='text-xs text-red-500 mt-1'>
							Já tem banca agendada em horário próximo
						</div>
					)}

					<div className='text-sm text-muted-foreground'>
						{professor.departamento} • {professor.titulacao}
					</div>

					{professor.especialidades && professor.especialidades.length > 0 && (
						<div className='flex flex-wrap gap-1 mt-1'>
							{professor.especialidades.map(esp => (
								<Badge key={esp} className='text-xs'>
									{esp}
								</Badge>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
