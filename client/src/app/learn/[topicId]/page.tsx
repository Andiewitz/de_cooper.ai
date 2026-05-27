import LessonPageClient from "./lesson-page-client";

export async function generateStaticParams() {
    return [
        { topicId: "physics" },
        { topicId: "mathematics" },
        { topicId: "computer-science" },
        { topicId: "chemistry" },
        { topicId: "astronomy" },
        { topicId: "general" },
    ];
}

interface Props {
    params: Promise<{ topicId: string }>;
}

export default async function LessonPage({ params }: Props) {
    const resolvedParams = await params;
    return <LessonPageClient key={resolvedParams.topicId} topicId={resolvedParams.topicId} />;
}
