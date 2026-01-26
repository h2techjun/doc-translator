import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

async function createPost(formData: FormData) {
    'use server';
    const supabase = await createClient();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    await supabase.from('posts').insert({
        author_id: user.id,
        title,
        content,
        category
    });

    redirect('/community?tab=' + category);
}

export default function WritePage() {
    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-6">글쓰기</h1>
            <form action={createPost} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-1">카테고리</label>
                    <select name="category" className="w-full border rounded-md p-2 bg-transparent dark:border-zinc-700">
                        <option value="free">자유게시판</option>
                        <option value="inquiry">문의게시판</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">제목</label>
                    <input name="title" required className="w-full border rounded-md p-2 bg-transparent dark:border-zinc-700" placeholder="제목을 입력하세요" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">내용</label>
                    <textarea name="content" required rows={10} className="w-full border rounded-md p-2 bg-transparent dark:border-zinc-700" placeholder="내용을 입력하세요" />
                </div>
                <button type="submit" className="w-full bg-black text-white py-3 rounded-md hover:bg-zinc-800 transition">
                    작성하기
                </button>
            </form>
        </div>
    );
}
