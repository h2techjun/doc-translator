import { ProfileForm } from '@/components/user/profile-form';

export default function ProfilePage() {
    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">프로필 설정</h1>
            <ProfileForm />
        </div>
    );
}
