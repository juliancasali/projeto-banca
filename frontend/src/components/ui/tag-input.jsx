import {useState} from "react"
import {X, Plus} from "lucide-react"
import {Badge} from "./badge"
import {Input} from "./input"
import {Button} from "./button"

export function TagInput({value = [], onChange}) {
	const [tagInput, setTagInput] = useState("")

	const handleAddTag = () => {
		const trimmedInput = tagInput.trim()
		if (trimmedInput && !value.includes(trimmedInput)) {
			const newTags = [...value, trimmedInput]
			onChange(newTags)
			setTagInput("")
		}
	}

	const handleKeyDown = e => {
		if (e.key === "Enter") {
			e.preventDefault()
			handleAddTag()
		}
	}

	const removeTag = tagToRemove => {
		const newTags = value.filter(tag => tag !== tagToRemove)
		onChange(newTags)
	}

	return (
		<div className='space-y-2'>
			{value?.length > 0 && (
				<div className='flex flex-wrap gap-2'>
					{value.map(tag => (
						<Badge
							key={tag}
							className='gap-1 px-2 py-1 text-xs'
						>
							{tag}
							<X
								className='h-3 w-3 cursor-pointer'
								onClick={() => removeTag(tag)}
							/>
						</Badge>
					))}
				</div>
			)}
			<div className='flex gap-2 items-center'>
				<Input
					value={tagInput}
					onChange={e => setTagInput(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder='Adicionar tag...'
					className='flex-1'
				/>
				<Button
					type='button'
					size='sm'
					onClick={handleAddTag}
					disabled={!tagInput.trim()}
				>
					<Plus className='h-4 w-4' />
				</Button>
			</div>
		</div>
	)
}
