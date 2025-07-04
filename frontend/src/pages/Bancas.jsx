import {useState} from "react"
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query"
import {
	Search,
	User,
	Edit,
	Plus,
	Trash2,
	AlertCircle,
	Upload,
	CheckCircle2,
	Tag,
} from "lucide-react"
import {format} from "date-fns"
import {ptBR} from "date-fns/locale"

import bancaService from "../services/bancaService"
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
import {Pagination} from "../components/ui/pagination"

export function Bancas() {
	const queryClient = useQueryClient()
	const [filtros, setFiltros] = useState({
		termo: "",
	})
	const [termoBusca, setTermoBusca] = useState("")

	const [dialogAberto, setDialogAberto] = useState(false)
	const [bancaAtual, setBancaAtual] = useState(null)
	const [formData, setFormData] = useState({
		titulo: "",
		aluno: "",
		orientador: "",
		curso: "",
		data: "",
		status: "agendada",
		tags: [],
	})

	const [confirmacaoExclusaoAberta, setConfirmacaoExclusaoAberta] =
		useState(false)
	const [bancaParaExcluir, setBancaParaExcluir] = useState(null)

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
		queryKey: ["bancas", filtros, paginaAtual, itensPorPagina],
		queryFn: () => bancaService.getBancas(filtros, paginaAtual, itensPorPagina),
	})

	const bancas = data?.itens || []
	const paginacao = data?.paginacao || {totalPaginas: 1, paginaAtual: 1}

	// Mutation para salvar banca (criar/editar)
	const salvarBancaMutation = useMutation({
		mutationFn: banca => {
			if (banca.id) {
				return bancaService.atualizarBanca(banca.id, banca)
			} else {
				return bancaService.criarBanca(banca)
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ["bancas"]})
			fecharDialog()
		},
	})

	// Mutation para excluir banca
	const excluirBancaMutation = useMutation({
		mutationFn: id => bancaService.removerBanca(id),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ["bancas"]})
			setConfirmacaoExclusaoAberta(false)
			setBancaParaExcluir(null)
		},
	})

	const formatarData = dataString => {
		const data = new Date(dataString)
		return format(data, "dd/MM/yyyy 'às' HH:mm", {locale: ptBR})
	}

	const formatarDataParaInput = dataString => {
		if (!dataString) return ""
		const data = new Date(dataString)
		return format(data, "yyyy-MM-dd'T'HH:mm", {locale: ptBR})
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

	const abrirDialogCriacao = () => {
		setBancaAtual(null)
		setFormData({
			titulo: "",
			aluno: "",
			orientador: "",
			curso: "",
			data: "",
			status: "agendada",
			tags: [],
		})
		setDialogAberto(true)
	}

	const abrirDialogEdicao = banca => {
		setBancaAtual(banca)
		setFormData({
			id: banca.id,
			titulo: banca.titulo,
			aluno: banca.aluno,
			orientador: banca.orientador,
			curso: banca.curso,
			data: formatarDataParaInput(banca.data),
			status: banca.status,
			tags: banca.tags || [],
		})
		setDialogAberto(true)
	}

	const fecharDialog = () => {
		setDialogAberto(false)
		setBancaAtual(null)
	}

	const handleFormChange = e => {
		const {name, value} = e.target
		setFormData(prev => ({...prev, [name]: value}))
	}

	const handleSelectChange = (name, value) => {
		setFormData(prev => ({...prev, [name]: value}))
	}

	const handleTagsChange = tags => {
		setFormData(prev => ({...prev, tags}))
	}

	const handleSalvarBanca = e => {
		e.preventDefault()
		salvarBancaMutation.mutate(formData)
	}

	const confirmarExclusao = banca => {
		setBancaParaExcluir(banca)
		setConfirmacaoExclusaoAberta(true)
	}

	const executarExclusao = () => {
		if (bancaParaExcluir) {
			excluirBancaMutation.mutate(bancaParaExcluir.id)
		}
	}

	const cancelarExclusao = () => {
		setConfirmacaoExclusaoAberta(false)
		setBancaParaExcluir(null)
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
					const banca = {
						id:
							row.id || `banca-${Math.random().toString(36).substring(2, 15)}`,
						titulo: row.titulo || "",
						aluno: row.aluno || "",
						orientador: row.orientador || "",
						curso: row.curso || "",
						data: row.data || new Date().toISOString(),
						status:
							row.status && ["agendada", "concluida"].includes(row.status)
								? row.status
								: "agendada",
						tags: row.tags ? row.tags.split(";").map(tag => tag.trim()) : [],
					}

					if (
						!banca.titulo ||
						!banca.aluno ||
						!banca.orientador ||
						!banca.curso
					) {
						throw new Error("Campos obrigatórios faltando")
					}

					await bancaService.criarBanca(banca)
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

			queryClient.invalidateQueries({queryKey: ["bancas"]})

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
		<div className='space-y-6 container max-w-7xl mx-auto'>
			<div className='mb-6'>
				<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
					<h2 className='text-2xl font-semibold'>Bancas</h2>
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
							<span className='hidden xs:inline'>Nova Banca</span>
							<span className='xs:hidden'>Nova</span>
						</Button>
					</div>
				</div>
			</div>

			<Card className='mb-6'>
				<CardHeader className='pb-3'>
					<CardTitle className='text-lg font-medium'>Buscar</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmitBusca} className='flex space-x-2'>
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
				</CardContent>
			</Card>

			{isLoading ? (
				<div className='p-8 text-center'>
					<div className='mb-2 text-lg'>Carregando bancas...</div>
					<div className='animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full'></div>
				</div>
			) : isError ? (
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
			) : bancas?.length === 0 ? (
				<div className='text-center p-6 text-muted-foreground'>
					Nenhuma banca encontrada com os filtros selecionados.
				</div>
			) : (
				<>
					<div className='hidden md:block overflow-x-auto rounded-md border border-border-muted'>
						<table className='w-full border-collapse bg-white'>
							<thead>
								<tr className='border-b border-border-muted bg-primary text-white'>
									<th className='text-left p-3 font-medium'>Título / Aluno</th>
									<th className='text-left p-3 font-medium'>Orientador</th>
									<th className='text-left p-3 font-medium'>Curso</th>
									<th className='text-left p-3 font-medium'>Data</th>
									<th className='text-left p-3 font-medium'>Tags</th>
									<th className='text-left p-3 font-medium'>Status</th>
									<th className='w-10'></th>
								</tr>
							</thead>
							<tbody>
								{bancas.map(banca => (
									<tr
										key={banca.id}
										className='border-b border-border-muted hover:bg-muted/50'
									>
										<td className='p-3'>
											<div
												className='font-medium truncate max-w-xs'
												title={banca.titulo}
											>
												{banca.titulo}
											</div>
											<div className='text-sm text-muted-foreground flex items-center gap-1'>
												<User className='h-3.5 w-3.5' /> {banca.aluno}
											</div>
										</td>
										<td className='p-3'>
											<div className='flex items-center gap-1'>
												<span>{banca.orientador}</span>
											</div>
										</td>
										<td className='p-3'>
											<div className='flex items-center gap-1'>
												<span>{banca.curso}</span>
											</div>
										</td>
										<td className='p-3 whitespace-nowrap'>
											<div className='flex items-center gap-1'>
												<span>{formatarData(banca.data)}</span>
											</div>
										</td>
										<td className='p-3'>
											{banca.tags && banca.tags.length > 0 ? (
												<div className='flex flex-wrap gap-1'>
													{banca.tags.map(tag => (
														<Badge key={tag} className='text-xs'>
															{tag}
														</Badge>
													))}
												</div>
											) : (
												<span className='text-muted-foreground text-sm'>-</span>
											)}
										</td>
										<td className='p-3'>{renderizarStatus(banca.status)}</td>
										<td className='p-3 text-right space-x-1'>
											<div className='flex gap-2'>
												<Button
													variant='ghost'
													size='sm'
													className='h-8 w-8 p-0'
													onClick={() => abrirDialogEdicao(banca)}
												>
													<span className='sr-only'>Editar</span>
													<Edit className='h-5 w-5 text-muted-foreground' />
												</Button>
												<Button
													variant='ghost'
													size='sm'
													className='h-8 w-8 p-0 text-destructive hover:text-destructive'
													onClick={() => confirmarExclusao(banca)}
												>
													<span className='sr-only'>Excluir</span>
													<Trash2 className='h-5 w-5' />
												</Button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className='md:hidden space-y-4'>
						{bancas.map(banca => (
							<Card key={banca.id} className='mb-3'>
								<CardContent>
									<div className='flex justify-between items-start'>
										<div>
											<h3
												className='font-medium line-clamp-2'
												title={banca.titulo}
											>
												{banca.titulo}
											</h3>
											<div className='text-sm text-muted-foreground flex items-center gap-1 mt-1'>
												<User className='h-3.5 w-3.5' /> {banca.aluno}
											</div>
										</div>
										<div className='flex-shrink-0'>
											{renderizarStatus(banca.status)}
										</div>
									</div>

									<div className='grid grid-cols-2 gap-3 text-sm'>
										<div>
											<div className='text-muted-foreground mb-1'>
												Orientador
											</div>
											<div className='flex items-center gap-1'>
												<span>{banca.orientador}</span>
											</div>
										</div>
										<div>
											<div className='text-muted-foreground mb-1'>Curso</div>
											<div className='flex items-center gap-1'>
												<span>{banca.curso}</span>
											</div>
										</div>
									</div>

									<div>
										<div className='text-muted-foreground mb-1 text-sm'>
											Data
										</div>
										<div className='flex items-center gap-1'>
											<span>{formatarData(banca.data)}</span>
										</div>
									</div>

									{banca.tags && banca.tags.length > 0 && (
										<div className='mt-2'>
											<div className='text-sm text-muted-foreground mb-1 flex items-center gap-1'>
												<Tag className='h-3 w-3' />
												Tags:
											</div>
											<div className='flex flex-wrap gap-1'>
												{banca.tags.map(tag => (
													<Badge key={tag} className='text-xs'>
														{tag}
													</Badge>
												))}
											</div>
										</div>
									)}

									<div className='flex justify-end pt-2 gap-2'>
										<Button
											variant='outline'
											size='sm'
											className='gap-1'
											onClick={() => abrirDialogEdicao(banca)}
										>
											<Edit className='h-4 w-4' />
											Editar
										</Button>
										<Button
											variant='outline'
											size='sm'
											className='gap-1 border-destructive text-destructive hover:bg-destructive/10'
											onClick={() => confirmarExclusao(banca)}
										>
											<Trash2 className='h-4 w-4' />
											Excluir
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</>
			)}

			<Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
				<DialogContent className='sm:max-w-[550px]'>
					<DialogHeader>
						<DialogTitle>
							{bancaAtual ? "Editar Banca" : "Nova Banca"}
						</DialogTitle>
						<DialogDescription>
							{bancaAtual
								? "Edite os detalhes da banca de TCC."
								: "Preencha os detalhes para criar uma nova banca."}
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSalvarBanca}>
						<div className='grid gap-4 py-4'>
							<div className='grid gap-2'>
								<Label htmlFor='titulo'>Título do Trabalho</Label>
								<Input
									id='titulo'
									name='titulo'
									value={formData.titulo}
									onChange={handleFormChange}
									required
								/>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='grid gap-2'>
									<Label htmlFor='aluno'>Aluno</Label>
									<Input
										id='aluno'
										name='aluno'
										value={formData.aluno}
										onChange={handleFormChange}
										required
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='orientador'>Orientador</Label>
									<Input
										id='orientador'
										name='orientador'
										value={formData.orientador}
										onChange={handleFormChange}
										required
									/>
								</div>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='grid gap-2'>
									<Label htmlFor='curso'>Curso</Label>
									<Input
										id='curso'
										name='curso'
										value={formData.curso}
										onChange={handleFormChange}
										required
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='status'>Status</Label>
									<Select
										value={formData.status}
										onValueChange={value => handleSelectChange("status", value)}
										className='!w-full'
									>
										<SelectTrigger id='status' className='!w-full'>
											<SelectValue placeholder='Selecione o status' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='agendada'>Agendada</SelectItem>
											<SelectItem value='concluida'>Concluída</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className='grid gap-2'>
								<Label htmlFor='data'>Data da Banca</Label>
								<Input
									id='data'
									name='data'
									type='datetime-local'
									value={formData.data}
									onChange={handleFormChange}
									required
								/>
							</div>

							<div className='grid gap-2'>
								<Label htmlFor='tags'>Tags</Label>
								<TagInput value={formData.tags} onChange={handleTagsChange} />
								<p className='text-xs text-muted-foreground'>
									Adicione tags para categorizar esta banca (ex: IA,
									desenvolvimento web, etc)
								</p>
							</div>
						</div>

						<DialogFooter>
							<Button type='button' variant='outline' onClick={fecharDialog}>
								Cancelar
							</Button>
							<Button type='submit' disabled={salvarBancaMutation.isPending}>
								{salvarBancaMutation.isPending
									? "Salvando..."
									: bancaAtual
									? "Salvar alterações"
									: "Criar banca"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
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
							Tem certeza que deseja excluir a banca{" "}
							<strong>{bancaParaExcluir?.titulo}</strong>?
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
							disabled={excluirBancaMutation.isPending}
						>
							{excluirBancaMutation.isPending ? "Excluindo..." : "Excluir"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
				<DialogContent className='sm:max-w-[550px]'>
					<DialogHeader>
						<DialogTitle>Importar Bancas via CSV</DialogTitle>
						<DialogDescription>
							Carregue um arquivo CSV com as bancas a serem importadas. O
							arquivo deve conter os campos: titulo, aluno, orientador, curso,
							data, status e tags.
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
										titulo,aluno,orientador,curso,data,status,tags
									</code>
									<p className='mt-2'>
										As tags devem ser separadas por ponto e vírgula (;)
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
											Total de bancas
										</div>
									</div>
									<div className='border rounded-md p-4 bg-white'>
										<div className='text-2xl font-bold text-green-600'>
											{importResult.success}
										</div>
										<div className='text-sm text-muted-foreground'>
											Importadas com sucesso
										</div>
									</div>
								</div>

								{importResult.errors.length > 0 && (
									<div className='mt-4'>
										<h4 className='font-medium text-destructive mb-2'>
											Erros ({importResult.errors.length})
										</h4>
										<div className='max-h-40 overflow-y-auto border rounded-md bg-white border-border-muted'>
											{importResult.errors.map((error, index) => (
												<div
													key={index}
													className='border-b p-2 text-sm border-border-muted'
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
								<div className='flex items-center gap-2 text-destructive mb-4'>
									<AlertCircle className='h-6 w-6' />
									<h3 className='text-lg font-medium'>Erro na importação</h3>
								</div>

								<p className='text-destructive mb-2'>
									{importResult.errors[0]?.error ||
										"Ocorreu um erro ao processar o arquivo."}
								</p>
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

			{!isLoading && !isError && bancas && bancas.length > 0 && (
				<Pagination
					currentPage={paginacao.paginaAtual}
					totalPages={paginacao.totalPaginas}
					onPageChange={handlePageChange}
				/>
			)}
		</div>
	)
}
