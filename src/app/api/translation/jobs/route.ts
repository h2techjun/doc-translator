
import { getUserSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { getDownloadUrl } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getUserSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const jobs = await prisma.job.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        const jobsWithUrls = await Promise.all(jobs.map(async (job) => {
            let url = null;
            if (job.status === 'COMPLETED' && job.translatedFileUrl) {
                try {
                    url = await getDownloadUrl(job.translatedFileUrl);
                } catch (e) {
                    console.error(`Failed to sign URL for job ${job.id}`, e);
                }
            }
            return {
                ...job,
                downloadUrl: url
            };
        }));

        return NextResponse.json({ jobs: jobsWithUrls });
    } catch (error) {
        console.error("Failed to fetch jobs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
