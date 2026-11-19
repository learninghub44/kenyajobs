// Short, shareable job links: /j/JH-1001 -> /job/<id>
import { getPublishedJobByNumber } from "@/lib/manualJobs";
import { parseJobRef } from "@/lib/jobOptions";

export default function JobRefRedirect() { return null; }

export async function getServerSideProps({ params }) {
  const number = parseJobRef(params.ref);
  if (!number) return { notFound: true };
  try {
    const job = await getPublishedJobByNumber(number);
    if (job) return { redirect: { destination: `/job/${encodeURIComponent(job.id)}`, permanent: false } };
  } catch (error) { console.error("job ref lookup:", error.message); }
  return { notFound: true };
}
