
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Bold, Italic, List, ListOrdered, Image as ImageIcon } from 'lucide-react'

interface TiptapProps {
    content?: string
    onChange?: (content: string) => void
    editable?: boolean
}

/**
 * 📝 Tiptap 에디터 컴포넌트
 * 
 * 커뮤니티 게시판용 리치 텍스트 에디터입니다.
 * StarterKit(기본 기능) + Image(이미지 업로드) 확장을 사용합니다.
 */
export function Tiptap({ content = '', onChange, editable = true }: TiptapProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
        ],
        content,
        editable,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[300px]',
            },
        },
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML())
        },
    })

    if (!editor) {
        return null
    }

    const addImage = () => {
        const url = window.prompt('URL')
        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }

    return (
        <div className="border rounded-md shadow-sm">
            {editable && (
                <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={cn(editor.isActive('bold') && 'bg-muted')}
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={cn(editor.isActive('italic') && 'bg-muted')}
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={cn(editor.isActive('bulletList') && 'bg-muted')}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={cn(editor.isActive('orderedList') && 'bg-muted')}
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={addImage}
                    >
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                </div>
            )}
            <EditorContent editor={editor} className="p-4" />
        </div>
    )
}
