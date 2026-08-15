import Link from "next/link";

/**
 * 제출 완료 화면.
 *
 * 개인 링크를 여기에 출력하지 않는다. 화면에 띄우면 남의 이메일 주소를 입력한
 * 사람이 그 사람의 개인 링크를 획득해 질문 전체를 열람할 수 있다 (PRD §2).
 * 링크는 이메일 채널로만 전달한다.
 */
export default async function SubmittedPage({
  params,
}: PageProps<"/submitted/[publicNo]">) {
  const { publicNo } = await params;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="card p-6 md:p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-success-bg text-success flex items-center justify-center text-2xl font-bold">
          ✓
        </div>
        <h1 className="mt-4 text-lg font-bold">질문이 접수되었습니다</h1>

        <p className="mt-4 text-xs text-sub">질문번호</p>
        <p className="mt-1 text-xl font-bold tracking-wider text-primary">
          {decodeURIComponent(publicNo)}
        </p>

        <div className="mt-6 rounded-lg bg-info-bg px-4 py-3.5 text-left">
          <p className="text-sm font-semibold">
            입력하신 이메일로 <strong>내 질문 확인 링크</strong>를 보냈습니다.
          </p>
          <p className="mt-1.5 text-[13px] text-sub leading-relaxed">
            그 링크에서 질문 내용과 답변을 확인할 수 있습니다. 답변이 등록되면
            다시 메일로 알려드립니다.
          </p>
        </div>

        <p className="mt-4 text-xs text-sub leading-relaxed">
          메일이 오지 않았다면 스팸함을 확인하시고,
          <br />그래도 없으면 아래에서 다시 받아보세요.
        </p>

        <div className="mt-5 flex gap-2 justify-center">
          <Link href="/link" className="btn-secondary">
            링크 다시 받기
          </Link>
          <Link href="/" className="btn-primary">
            새 질문 보내기
          </Link>
        </div>
      </div>
    </div>
  );
}
