
'use client';

import { useState } from 'react';
import { Tiptap } from '@/components/editor/tiptap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CommunityPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('<p>Share your translation tips here...</p>');

    const handleSubmit = () => {
        // MVP: Just log to console
        console.log({ title, content });
        alert('Post submitted! (Check console)');
    };

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Community Board</h1>

            <div className="grid gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Create a New Post</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Post Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-lg font-medium"
                        />
                        <Tiptap content={content} onChange={setContent} />
                        <div className="flex justify-end">
                            <Button onClick={handleSubmit}>Publish Post</Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Recent Posts</h2>
                    {/* Mock List */}
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <CardTitle className="text-lg">How to optimize PDF for translation #{i}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground line-clamp-2">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
