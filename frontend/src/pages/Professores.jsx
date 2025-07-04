import {useState} from "react"
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query"
import {
	Search,
	Edit,
	Plus,
	Trash2,
	AlertCircle,
	Upload,
	CheckCircle2,
	Mail,
} from "lucide-react"

import professorService from "../services/professorService"
import {Card, CardContent, CardHeader, CardTitle} from "../components/ui/card"
import {Input} from "../components/ui/input"
import {Button} from "../components/ui/button"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select"
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
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../components/ui/alert-dialog"
import {Label} from "../components/ui/label"
import {TagInput} from "../components/ui/tag-input"
import {FileUpload} from "../components/ui/file-upload"
import {parseCSVFile} from "../utils/csvParser"
import {Switch} from "../components/ui/switch"
import {Pagination} from "../components/ui/pagination"

export function Professores() {
	const queryClient = useQueryClient()
	const [filtros, setFiltros] = useState({
		termo: "",
	})
	const [termoBusca, setTermoBusca] = useState("")

	const [dialogAberto, setDialogAberto] = useState(false)
	const [professorAtual, setProfessorAtual] = useState(null)
	const [formData, setFormData] = useState({
		nome: "",
		email: "",
		departamento: "",
		titulacao: "",
		especialidades: [],
		disponivel: true,
	})

	const [confirmacaoExclusaoAberta, setConfirmacaoExclusaoAberta] =
		useState(false)
	const [professorParaExcluir, setProfessorParaExcluir] = useState(null)

	const [importDialogOpen, setImportDialogOpen] = useState(false)
	const [importFile, setImportFile] = useState(null)
	const [importStatus, setImportStatus] = useState(null) // "loading", "success", "error"
	const [importResult, setImportResult] = useState({
		total: 0,
		success: 0,
		errors: [],
	})

	const [paginaAtual, setPaginaAtual] = useState(1)
	const [itensPorPagina] = useState(5)

	const {data, isLoading, isError} = useQuery({
		queryKey: ["professores", filtros, paginaAtual, itensPorPagina],
		queryFn: () =>
			professorService.getProfessores(filtros, paginaAtual, itensPorPagina),
	})

	const professores = data?.itens || []
	const paginacao = data?.paginacao || {totalPaginas: 1, paginaAtual: 1}

	// Mutation para salvar professor (criar/editar)
	const salvarProfessorMutation = useMutation({
		mutationFn: professor => {
			if (professor.id) {
				return professorService.atualizarProfessor(professor.id, professor)
			} else {
				return professorService.criarProfessor(professor)
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ["professores"]})
			fecharDialog()
		},
	})

	// Mutation para excluir professor
	const excluirProfessorMutation = useMutation({
		mutationFn: id => professorService.removerProfessor(id),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ["professores"]})
			setConfirmacaoExclusaoAberta(false)
			setProfessorParaExcluir(null)
		},
	})

	const handleSubmitBusca = e => {
		e.preventDefault()
		setFiltros(prev => ({...prev, termo: termoBusca}))
	}

	const handleEspecialidadesChange = especialidades => {
		setFormData(prev => ({...prev, especialidades}))
	}

	const handleSelectChange = (name, value) => {
		setFormData(prev => ({...prev, [name]: value}))
	}

	const handleFormChange = e => {
		const {name, value} = e.target
		setFormData(prev => ({...prev, [name]: value}))
	}

	const abrirDialogCriacao = () => {
		setProfessorAtual(null)
		setFormData({
			nome: "",
			email: "",
			departamento: "",
			titulacao: "",
			especialidades: [],
			disponivel: true,
		})
		setDialogAberto(true)
	}

	const abrirDialogEdicao = professor => {
		setProfessorAtual(professor)
		setFormData({
			...professor,
			especialidades: professor.especialidades || [],
		})
		setDialogAberto(true)
	}

	const fecharDialog = () => {
		setDialogAberto(false)
		setProfessorAtual(null)
	}

	const abrirConfirmacaoExclusao = professor => {
		setProfessorParaExcluir(professor)
		setConfirmacaoExclusaoAberta(true)
	}

	const cancelarExclusao = () => {
		setConfirmacaoExclusaoAberta(false)
		setProfessorParaExcluir(null)
	}

	const executarExclusao = () => {
		if (professorParaExcluir) {
			excluirProfessorMutation.mutate(professorParaExcluir.id)
		}
	}

	const processCSVImport = async () => {
		if (!importFile) return

		try {
			setImportStatus("loading")

			const data = await parseCSVFile(importFile)

			const results = {
				total: data.length,
				success: 0,
				errors: [],
			}

			for (const row of data) {
				try {
					const professor = {
						id:
							row.id ||
							`professor-${Math.random().toString(36).substring(2, 15)}`,
						nome: row.nome || "",
						email: row.email || "",
						departamento: row.departamento || "",
						titulacao: row.titulacao || "",
						especialidades: row.especialidades
							? row.especialidades.split(";").map(esp => esp.trim())
							: [],
						disponivel: row.disponivel === "sim",
					}

					if (!professor.nome || !professor.email || !professor.departamento) {
						throw new Error("Campos obrigatórios faltando")
					}

					await professorService.criarProfessor(professor)
					results.success++
				} catch (error) {
					results.errors.push({
						row: JSON.stringify(row),
						error: error.message,
					})
				}
			}

			setImportResult(results)
			setImportStatus("success")

			queryClient.invalidateQueries({queryKey: ["professores"]})

			if (results.success === results.total) {
				setTimeout(() => {
					setImportDialogOpen(false)
					setImportFile(null)
					setImportStatus(null)
				}, 3000)
			}
		} catch (error) {
			setImportStatus("error")
			setImportResult({
				total: 0,
				success: 0,
				errors: [{row: "Arquivo CSV", error: error.message}],
			})
		}
	}

	const handleSalvarProfessor = e => {
		e.preventDefault()

		const professorData = professorAtual
			? {...formData, id: professorAtual.id}
			: formData

		salvarProfessorMutation.mutate(professorData)
	}

	const renderizarDisponibilidade = disponivel => {
		return disponivel ? (
			<Badge
				variant='outline'
				className='bg-green-50 text-green-700 border-green-200'
			>
				Ativo
			</Badge>
		) : (
			<Badge
				variant='outline'
				className='bg-red-50 text-red-700 border-red-200'
			>
				Inativo
			</Badge>
		)
	}

	const handlePageChange = newPage => {
		setPaginaAtual(newPage)
		window.scrollTo({top: 0, behavior: "smooth"})
	}

	const resetImportState = () => {
		setImportStatus(null)
		setImportFile(null)
		setImportResult({
			total: 0,
			success: 0,
			errors: [],
		})
	}

	return (
		<div className='container max-w-7xl mx-auto'>
			<div className='mb-6'>
				<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
					<h2 className='text-2xl font-semibold'>Professores</h2>
					<div className='flex flex-col xs:flex-row gap-2 w-full sm:w-auto'>
						<Button
							variant='outline'
							onClick={() => setImportDialogOpen(true)}
							className='gap-2 justify-center'
							size='sm'
						>
							<Upload className='h-4 w-4' />
							<span className='hidden xs:inline'>Importar CSV</span>
							<span className='xs:hidden'>Importar</span>
						</Button>
						<Button
							onClick={abrirDialogCriacao}
							className='gap-2 justify-center'
							size='sm'
						>
							<Plus className='h-4 w-4' />
							<span className='hidden xs:inline'>Novo Professor</span>
							<span className='xs:hidden'>Novo</span>
						</Button>
					</div>
				</div>
			</div>

			{/* Formulário de Busca e Filtros */}
			<Card className='mb-6'>
				<CardHeader className='pb-3'>
					<CardTitle className='text-lg font-medium'>Buscar</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						<form onSubmit={handleSubmitBusca} className='flex space-x-2'>
							<div className='relative flex-1'>
								<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
								<Input
									type='search'
									placeholder='Buscar professor, email, departamento...'
									className='pl-8'
									value={termoBusca}
									onChange={e => setTermoBusca(e.target.value)}
								/>
							</div>
							<Button type='submit'>Buscar</Button>
						</form>
					</div>
				</CardContent>
			</Card>

			{/* Loading e Error States */}
			{isLoading ? (
				<div className='p-8 text-center'>
					<div className='mb-2 text-lg'>Carregando professores...</div>
					<div className='animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full'></div>
				</div>
			) : isError ? (
				<div className='p-8 text-center'>
					<div className='text-destructive mb-2'>
						Erro ao carregar professores
					</div>
					<Button
						onClick={() =>
							queryClient.invalidateQueries({queryKey: ["professores"]})
						}
					>
						Tentar novamente
					</Button>
				</div>
			) : professores.length === 0 ? (
				<div className='text-center p-6 text-muted-foreground'>
					Nenhum professor encontrado com os filtros selecionados.
				</div>
			) : (
				<>
					{/* Lista de Professores (View Desktop) */}
					<div className='hidden md:block overflow-hidden rounded-md border border-border-muted'>
						<div className='overflow-x-auto'>
							<table className='w-full bg-white'>
								<thead>
									<tr className='border-b border-border-muted bg-primary text-white'>
										<th className='text-left p-3 font-medium'>
											Professor / Email
										</th>
										<th className='text-left p-3 font-medium'>Departamento</th>
										<th className='text-left p-3 font-medium'>Titulação</th>
										<th className='text-left p-3 font-medium'>
											Especialidades
										</th>
										<th className='text-left p-3 font-medium'>
											Disponibilidade
										</th>
										<th className='w-10'></th>
									</tr>
								</thead>
								<tbody>
									{professores.length === 0 ? (
										<tr>
											<td
												colSpan={6}
												className='p-8 text-center text-muted-foreground'
											>
												Nenhum professor encontrado com os filtros selecionados.
											</td>
										</tr>
									) : (
										professores.map(professor => (
											<tr
												key={professor.id}
												className='border-b transition-colors border-border-muted hover:bg-muted/30'
											>
												<td className='p-3'>
													<div className='font-medium truncate max-w-xs'>
														{professor.nome}
													</div>
													<div className='text-sm text-muted-foreground flex items-center gap-1'>
														<Mail className='h-3.5 w-3.5' /> {professor.email}
													</div>
												</td>
												<td className='p-3'>
													<div className='flex items-center gap-1'>
														<span>{professor.departamento}</span>
													</div>
												</td>
												<td className='p-3'>
													<div className='flex items-center gap-1'>
														<span>{professor.titulacao || "-"}</span>
													</div>
												</td>
												<td className='p-3'>
													{professor.especialidades &&
													professor.especialidades.length > 0 ? (
														<div className='flex flex-wrap gap-1'>
															{professor.especialidades.map(esp => (
																<Badge key={esp} className='px-1 py-0 text-xs'>
																	{esp}
																</Badge>
															))}
														</div>
													) : (
														<span className='text-muted-foreground'>-</span>
													)}
												</td>
												<td className='p-3'>
													{renderizarDisponibilidade(professor.disponivel)}
												</td>
												<td className='p-3'>
													<div className='flex justify-end gap-2'>
														<Button
															variant='ghost'
															size='icon'
															onClick={() => abrirDialogEdicao(professor)}
														>
															<Edit className='h-4 w-4' />
														</Button>
														<Button
															variant='ghost'
															size='icon'
															className='text-destructive'
															onClick={() =>
																abrirConfirmacaoExclusao(professor)
															}
														>
															<Trash2 className='h-4 w-4' />
														</Button>
													</div>
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</div>

					{/* Lista de Professores (View Mobile) */}
					<div className='md:hidden grid grid-cols-1 gap-4'>
						{professores.length === 0 ? (
							<Card>
								<CardContent className='p-8 text-center text-muted-foreground'>
									Nenhum professor encontrado com os filtros selecionados.
								</CardContent>
							</Card>
						) : (
							professores.map(professor => (
								<Card key={professor.id}>
									<CardContent>
										<div className='flex justify-between items-start'>
											<div>
												<h3
													className='font-medium line-clamp-2'
													title={professor.nome}
												>
													{professor.nome}
												</h3>
												<div className='text-sm text-muted-foreground flex items-center gap-1 mt-2'>
													<Mail className='h-3.5 w-3.5' /> {professor.email}
												</div>
												<div className='text-sm text-muted-foreground flex items-center gap-1 mt-1'>
													{professor.departamento}
												</div>
												<div className='text-sm text-muted-foreground flex items-center gap-1 mt-1'>
													{professor.titulacao || "-"}
												</div>

												{professor.especialidades &&
													professor.especialidades.length > 0 && (
														<div className='flex flex-wrap gap-1 mt-2'>
															{professor.especialidades.map(esp => (
																<Badge key={esp} className='px-1 py-0 text-xs'>
																	{esp}
																</Badge>
															))}
														</div>
													)}
											</div>
											<div className='flex-shrink-0'>
												{renderizarDisponibilidade(professor.disponivel)}
											</div>
										</div>

										<div className='flex justify-end gap-2 mt-3'>
											<Button
												variant='outline'
												size='sm'
												className='h-8'
												onClick={() => abrirDialogEdicao(professor)}
											>
												<Edit className='h-3.5 w-3.5 mr-1' />
												Editar
											</Button>
											<Button
												variant='outline'
												size='sm'
												className='h-8 border-destructive text-destructive'
												onClick={() => abrirConfirmacaoExclusao(professor)}
											>
												<Trash2 className='h-3.5 w-3.5 mr-1' />
												Excluir
											</Button>
										</div>
									</CardContent>
								</Card>
							))
						)}
					</div>
				</>
			)}

			{/* Form Dialog */}
			<Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
				<DialogContent className='sm:max-w-[550px]'>
					<DialogHeader>
						<DialogTitle>
							{professorAtual ? "Editar Professor" : "Novo Professor"}
						</DialogTitle>
						<DialogDescription>
							{professorAtual
								? "Edite os detalhes do professor."
								: "Preencha os detalhes para cadastrar um novo professor."}
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSalvarProfessor}>
						<div className='grid gap-4 py-4'>
							<div className='grid gap-2'>
								<Label htmlFor='nome'>Nome Completo</Label>
								<Input
									id='nome'
									name='nome'
									value={formData.nome}
									onChange={handleFormChange}
									required
								/>
							</div>

							<div className='grid gap-2'>
								<Label htmlFor='email'>Email</Label>
								<Input
									id='email'
									name='email'
									type='email'
									value={formData.email}
									onChange={handleFormChange}
									required
								/>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='grid gap-2'>
									<Label htmlFor='departamento'>Departamento</Label>
									<Input
										id='departamento'
										name='departamento'
										value={formData.departamento}
										onChange={handleFormChange}
										required
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='titulacao'>Titulação</Label>
									<Select
										value={formData.titulacao}
										onValueChange={value =>
											handleSelectChange("titulacao", value)
										}
										className='!w-full'
									>
										<SelectTrigger id='titulacao' className='!w-full'>
											<SelectValue placeholder='Selecione a titulação' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='Doutor'>Doutor(a)</SelectItem>
											<SelectItem value='Mestre'>Mestre</SelectItem>
											<SelectItem value='Especialista'>Especialista</SelectItem>
											<SelectItem value='Graduado'>Graduado(a)</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className='grid gap-2'>
								<Label htmlFor='especialidades'>Especialidades</Label>
								<TagInput
									value={formData.especialidades}
									onChange={handleEspecialidadesChange}
								/>
								<p className='text-xs text-muted-foreground'>
									Adicione especialidades para facilitar a busca por professores
									(ex: IA, desenvolvimento web, etc)
								</p>
							</div>

							<div className='grid gap-2'>
								<div className='flex flex-row items-center gap-2'>
									<Switch
										id='disponivel'
										name='disponivel'
										checked={formData.disponivel}
										onCheckedChange={value =>
											setFormData(prev => ({...prev, disponivel: value}))
										}
									/>
									<Label htmlFor='disponivel'>Professor Ativo</Label>
								</div>
								<p className='text-xs text-muted-foreground'>
									Indique se o professor está ativo no sistema
								</p>
							</div>
						</div>

						<DialogFooter>
							<Button type='button' variant='outline' onClick={fecharDialog}>
								Cancelar
							</Button>
							<Button
								type='submit'
								disabled={salvarProfessorMutation.isPending}
							>
								{salvarProfessorMutation.isPending
									? "Salvando..."
									: professorAtual
									? "Salvar alterações"
									: "Criar professor"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Dialog de Confirmação de Exclusão */}
			<AlertDialog
				open={confirmacaoExclusaoAberta}
				onOpenChange={setConfirmacaoExclusaoAberta}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className='flex items-center gap-2'>
							<AlertCircle className='h-5 w-5 text-destructive' />
							Confirmar exclusão
						</AlertDialogTitle>
						<AlertDialogDescription>
							Tem certeza que deseja excluir o professor{" "}
							<strong>{professorParaExcluir?.nome}</strong>?
							<div className='mt-2 font-medium'>
								Esta ação não poderá ser desfeita.
							</div>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={cancelarExclusao}>
							Cancelar
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={executarExclusao}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
							disabled={excluirProfessorMutation.isPending}
						>
							{excluirProfessorMutation.isPending ? "Excluindo..." : "Excluir"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Dialog de Importação CSV */}
			<Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
				<DialogContent className='sm:max-w-[550px]'>
					<DialogHeader>
						<DialogTitle>Importar Professores via CSV</DialogTitle>
						<DialogDescription>
							Carregue um arquivo CSV com os professores a serem importados. O
							arquivo deve conter os campos: nome, email, departamento,
							titulacao, especialidades e disponivel.
						</DialogDescription>
					</DialogHeader>

					<div className='py-4'>
						{!importStatus && (
							<>
								<FileUpload
									accept='.csv'
									onFileSelect={setImportFile}
									className='mb-4'
								/>

								<div className='text-sm text-muted-foreground mt-4'>
									<p className='font-medium mb-2'>Formato esperado do CSV:</p>
									<code className='bg-muted p-2 block rounded-md text-xs'>
										nome,email,departamento,titulacao,especialidades,disponivel
									</code>
									<p className='mt-2'>
										As especialidades devem ser separadas por ponto e vírgula
										(;)
									</p>
									<p className='mt-1'>
										O campo disponivel deve ser "sim" ou "não"
									</p>
								</div>
							</>
						)}

						{importStatus === "loading" && (
							<div className='flex flex-col items-center py-8 gap-4'>
								<div className='animate-spin'>
									<svg
										className='h-8 w-8 text-primary'
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'
									>
										<circle
											className='opacity-25'
											cx='12'
											cy='12'
											r='10'
											stroke='currentColor'
											strokeWidth='4'
										></circle>
										<path
											className='opacity-75'
											fill='currentColor'
											d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
										></path>
									</svg>
								</div>
								<div className='text-center'>
									<p className='font-medium'>Processando arquivo...</p>
									<p className='text-sm text-muted-foreground'>
										Isso pode levar alguns instantes, dependendo do tamanho do
										arquivo.
									</p>
								</div>
							</div>
						)}

						{importStatus === "success" && (
							<div className='py-4'>
								<div className='flex items-center gap-2 text-green-600 mb-4'>
									<CheckCircle2 className='h-6 w-6' />
									<h3 className='text-lg font-medium'>Importação concluída</h3>
								</div>

								<div className='grid grid-cols-2 gap-4 mb-4 text-center'>
									<div className='border rounded-md p-4 bg-white'>
										<div className='text-2xl font-bold'>
											{importResult.total}
										</div>
										<div className='text-sm text-muted-foreground'>
											Total de professores
										</div>
									</div>
									<div className='border rounded-md p-4 bg-white'>
										<div className='text-2xl font-bold text-green-600'>
											{importResult.success}
										</div>
										<div className='text-sm text-muted-foreground'>
											Importados com sucesso
										</div>
									</div>
								</div>

								{importResult.errors.length > 0 && (
									<div className='mt-4'>
										<h4 className='font-medium text-destructive mb-2'>
											Erros ({importResult.errors.length})
										</h4>
										<div className='max-h-40 overflow-y-auto border rounded-md border-border-muted bg-white'>
											{importResult.errors.map((error, index) => (
												<div
													key={index}
													className='border-b border-border-muted p-2 text-sm'
												>
													<div className='font-medium'>Linha: {index + 1}</div>
													<div className='text-destructive'>{error.error}</div>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						)}

						{importStatus === "error" && (
							<div className='py-4'>
								<div className='flex flex-col items-center text-center mb-4'>
									<AlertCircle className='text-destructive h-8 w-8 mb-2' />
									<h3 className='font-medium'>Erro ao importar arquivo</h3>
									<p className='text-sm text-muted-foreground mb-2'>
										{importResult.errors.length} de {importResult.total}{" "}
										registros não puderam ser importados.
									</p>
								</div>

								{importResult.errors.length > 0 && (
									<div className='bg-muted rounded-md p-3 mb-4 max-h-40 overflow-y-auto'>
										<h4 className='text-sm font-medium mb-2'>
											Detalhes dos erros:
										</h4>
										<ul className='text-sm space-y-1'>
											{importResult.errors.map((error, i) => (
												<li key={i} className='text-destructive'>
													{error}
												</li>
											))}
										</ul>
									</div>
								)}
							</div>
						)}
					</div>

					<DialogFooter>
						{!importStatus && (
							<>
								<Button
									variant='outline'
									onClick={() => setImportDialogOpen(false)}
								>
									Cancelar
								</Button>
								<Button onClick={processCSVImport} disabled={!importFile}>
									Importar
								</Button>
							</>
						)}
						{(importStatus === "success" || importStatus === "error") && (
							<>
								<Button variant='outline' onClick={resetImportState}>
									Tentar novamente
								</Button>
								<Button onClick={() => setImportDialogOpen(false)}>
									Fechar
								</Button>
							</>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Componente de Paginação */}
			{!isLoading && !isError && professores && professores.length > 0 && (
				<Pagination
					currentPage={paginacao.paginaAtual}
					totalPages={paginacao.totalPaginas}
					onPageChange={handlePageChange}
				/>
			)}
		</div>
	)
}
